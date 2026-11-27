/**
 * ============================================================
 *  FIGURINHA COM SOM (Sound Sticker) para bots de WhatsApp com Baileys
 *  Extraído do bot ★彡 ASTA MD 彡★ — criado por ★彡 GEOVANE MD 彡★
 * ============================================================
 *
 * O formato que o WhatsApp usa (descoberto analisando mensagens reais):
 *
 *   Message {
 *     audioStickerMessage (campo 134, FutureProofMessage) {
 *       message {
 *         stickerMessage { ...figurinha webp..., audioMessage (campo 26) { nota de voz opus } }
 *       }
 *     }
 *   }
 *
 * O Baileys ainda não conhece os campos 134 e 26, então este arquivo:
 *   1) ensina o codec protobuf do Baileys a ler/escrever esses campos (patch seguro, testado na hora)
 *   2) prepara o áudio (corta, fade, normaliza volume, Opus 48 kHz mono + waveform)
 *   3) gera uma capa com a onda do som (ou usa uma imagem sua)
 *   4) sobe figurinha + áudio e envia como UMA mensagem
 *
 * Quem ainda não tem o recurso no WhatsApp vê uma figurinha comum.
 *
 * Requisitos: Node 18+, ffmpeg no PATH (com libopus e libwebp), pacote "sharp" e o Baileys do seu bot.
 */
import fs from 'fs/promises';
import fsSync from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { spawn } from 'child_process';
import sharp from 'sharp';

const require = createRequire(import.meta.url);

/* ------------------------------------------------------------------ */
/* 0) Encontrar o Baileys do bot                                       */
/* ------------------------------------------------------------------ */

// nomes mais comuns do pacote Baileys (o primeiro que existir é usado)
const BAILEYS_NAMES = ['baileys', '@whiskeysockets/baileys', '@itsukichan/baileys', '@adiwajshing/baileys', '@fizzxydev/baileys-pro'];
let B = null;          // módulo do Baileys
let baileysName = null;

const unwrap = (m) => (m?.proto ? m : m?.default?.proto ? m.default : m);

/**
 * Opcional: passe o módulo do Baileys que o seu bot já usa (garante que é a MESMA cópia).
 *   import * as baileys from '@whiskeysockets/baileys';
 *   useBaileys(baileys)
 * CommonJS:  useBaileys(require('@whiskeysockets/baileys'))
 */
export function useBaileys(mod, name = null) {
  B = unwrap(mod);
  baileysName = name;
  codecReady = false;
  return installStickerAudioProtocol();
}

async function autoLoadBaileys() {
  if (B) return B;
  for (const n of BAILEYS_NAMES) {
    try {
      const m = unwrap(await import(n));
      if (m?.proto?.Message) { B = m; baileysName = n; return B; }
    } catch { /* tenta o próximo */ }
  }
  throw new Error('[FIG-SOM] Não achei o Baileys. Chame useBaileys(require("seu-baileys")) antes de usar.');
}

const loadReader = () => {
  // usa o MESMO protobufjs do Baileys (senão o patch não pega)
  const tries = [];
  if (baileysName) tries.push(() => createRequire(require.resolve(baileysName))('protobufjs/minimal').Reader);
  for (const n of BAILEYS_NAMES) tries.push(() => createRequire(require.resolve(n))('protobufjs/minimal').Reader);
  tries.push(() => require('protobufjs/minimal').Reader);
  for (const t of tries) { try { const R = t(); if (R) return R; } catch { } }
  throw new Error('protobufjs não encontrado');
};

/* ------------------------------------------------------------------ */
/* 1) Patch do codec: Message.audioStickerMessage (134) e              */
/*    StickerMessage.audioMessage (26)                                 */
/* ------------------------------------------------------------------ */

const AUDIO_FIELD = 26;
const AUDIO_TAG = (AUDIO_FIELD << 3) | 2;
const WRAP_FIELD = 134;
const WRAP_TAG = (WRAP_FIELD << 3) | 2;
let codecReady = false;

export function installStickerAudioProtocol() {
  if (codecReady) return true;
  if (!B) return false;
  try {
    const M = B.proto.Message;
    const T = M.StickerMessage;
    const A = M.AudioMessage;
    const F = M.FutureProofMessage;
    if (!M || !T || !A || !F) return false;
    const Reader = loadReader();

    const origT = { encode: T.encode, decode: T.decode, fromObject: T.fromObject, toObject: T.toObject };
    const origM = { encode: M.encode, decode: M.decode, fromObject: M.fromObject, toObject: M.toObject };

    // --- StickerMessage.audioMessage (26) ---
    const nativeSticker = T.decode(T.encode({ audioMessage: { seconds: 1 } }).finish()).audioMessage;
    if (!nativeSticker) {
      T.encode = function (value, writer) {
        const out = origT.encode.call(this, value, writer);
        if (value && value.audioMessage != null) A.encode(value.audioMessage, out.uint32(AUDIO_TAG).fork()).ldelim();
        return out;
      };
      T.decode = function (input, length, ...rest) {
        const reader = input instanceof Reader ? input : Reader.create(input);
        const start = reader.pos;
        const out = origT.decode.call(this, reader, length, ...rest);
        const scan = Reader.create(reader.buf.subarray(start, reader.pos));
        while (scan.pos < scan.len) {
          const tag = scan.uint32();
          if ((tag >>> 3) === AUDIO_FIELD && (tag & 7) === 2) out.audioMessage = A.decode(scan, scan.uint32());
          else scan.skipType(tag & 7);
        }
        return out;
      };
      T.fromObject = function (value) {
        const out = origT.fromObject.call(this, value);
        if (value && value.audioMessage != null) out.audioMessage = A.fromObject(value.audioMessage);
        return out;
      };
      T.toObject = function (value, options) {
        const out = origT.toObject.call(this, value, options);
        if (value && value.audioMessage != null) out.audioMessage = A.toObject(value.audioMessage, options);
        return out;
      };
    }

    // --- Message.audioStickerMessage (134) ---
    const nativeWrap = (() => {
      try { return M.decode(M.encode({ audioStickerMessage: { message: { conversation: 'x' } } }).finish()).audioStickerMessage; }
      catch { return null; }
    })();
    if (!nativeWrap) {
      M.encode = function (value, writer) {
        // O stickerMessage "de fora" é só um marcador para o Baileys mandar mediatype="sticker".
        // Ele NÃO vai para o fio — só o de dentro do embrulho.
        if (value && value.audioStickerMessage != null && value.stickerMessage != null) {
          const { stickerMessage, ...rest } = value;
          value = rest;
        }
        const out = origM.encode.call(this, value, writer);
        if (value && value.audioStickerMessage != null) F.encode(value.audioStickerMessage, out.uint32(WRAP_TAG).fork()).ldelim();
        return out;
      };
      M.decode = function (input, length, ...rest) {
        const reader = input instanceof Reader ? input : Reader.create(input);
        const start = reader.pos;
        const out = origM.decode.call(this, reader, length, ...rest);
        const scan = Reader.create(reader.buf.subarray(start, reader.pos));
        while (scan.pos < scan.len) {
          const tag = scan.uint32();
          if ((tag >>> 3) === WRAP_FIELD && (tag & 7) === 2) out.audioStickerMessage = F.decode(scan, scan.uint32());
          else scan.skipType(tag & 7);
        }
        return out;
      };
      M.fromObject = function (value) {
        const out = origM.fromObject.call(this, value);
        if (value && value.audioStickerMessage != null) out.audioStickerMessage = F.fromObject(value.audioStickerMessage);
        return out;
      };
      M.toObject = function (value, options) {
        const out = origM.toObject.call(this, value, options);
        if (value && value.audioStickerMessage != null) out.audioStickerMessage = F.toObject(value.audioStickerMessage, options);
        return out;
      };
    }

    // confere ida e volta; se falhar, desfaz tudo (o bot continua normal)
    const probe = M.decode(M.encode({ audioStickerMessage: { message: { stickerMessage: { audioMessage: { seconds: 3 } } } } }).finish());
    const got = probe.audioStickerMessage?.message?.stickerMessage?.audioMessage;
    if (!got || Number(got.seconds) !== 3) {
      Object.assign(T, origT);
      Object.assign(M, origM);
      return false;
    }
    codecReady = true;
    return true;
  } catch (e) {
    console.error('[FIG-SOM] Falha ao instalar codec:', e.message);
    return false;
  }
}

export const stickerAudioReady = () => codecReady;

// instala sozinho ao importar (se achar o Baileys)
try { await autoLoadBaileys(); installStickerAudioProtocol(); } catch (e) { console.warn(e.message); }

/* ------------------------------------------------------------------ */
/* 2) Áudio: cortar, normalizar, Opus, waveform                        */
/* ------------------------------------------------------------------ */

export const DEFAULT_SECONDS = 10;
export const MIN_SECONDS = 1;
export let MAX_SECONDS = 30;
/** Muda o limite de duração do som (padrão 30s). */
export const setSoundLimits = ({ maxSeconds } = {}) => {
  const n = Number(maxSeconds);
  if (Number.isFinite(n) && n >= MIN_SECONDS) MAX_SECONDS = Math.round(n);
  return MAX_SECONDS;
};
const PCM_RATE = 8000;
const MAX_ANALYSIS_SECONDS = 15 * 60;

/** Erro "amigável": a mensagem pode ser mostrada direto para o usuário. */
export class SoundStickerError extends Error {}

let TMP_DIR = path.join(os.tmpdir(), 'figurinha-com-som');
/** Opcional: muda a pasta de arquivos temporários. */
export const setTmpDir = (dir) => { TMP_DIR = dir; };
export const tmpFile = (ext) => {
  if (!fsSync.existsSync(TMP_DIR)) fsSync.mkdirSync(TMP_DIR, { recursive: true });
  return path.join(TMP_DIR, `fs_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${ext}`);
};

export const runFfmpeg = (args, timeoutMs = 180_000) =>
  new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; if (err.length > 4000) err = err.slice(-4000); });
    const timer = setTimeout(() => { p.kill('SIGKILL'); reject(new Error('ffmpeg: tempo esgotado')); }, timeoutMs);
    p.on('error', (e) => { clearTimeout(timer); reject(new Error(`ffmpeg não encontrado/erro: ${e.message}`)); });
    p.on('close', (code) => {
      clearTimeout(timer);
      code === 0 ? resolve() : reject(new Error(`ffmpeg saiu com código ${code}: ${err.trim().split('\n').pop()}`));
    });
  });

const convert = async (buffer, inExt, outExt, args) => {
  const inPath = tmpFile(inExt || 'bin');
  const outPath = tmpFile(outExt);
  try {
    await fs.writeFile(inPath, buffer);
    await runFfmpeg(args(inPath, outPath));
    const out = await fs.readFile(outPath);
    if (!out.length) throw new Error('conversão gerou arquivo vazio');
    return out;
  } finally {
    fs.unlink(inPath).catch(() => {});
    fs.unlink(outPath).catch(() => {});
  }
};

const decodePcm = async (buffer, ext) => {
  const raw = await convert(buffer, ext, 'pcm', (i, o) => [
    '-t', String(MAX_ANALYSIS_SECONDS), '-i', i, '-vn', '-ac', '1', '-ar', String(PCM_RATE), '-f', 's16le', o
  ]);
  const aligned = Buffer.from(raw);
  return new Int16Array(aligned.buffer, aligned.byteOffset, Math.floor(aligned.length / 2));
};

/** Início (s) do trecho mais "forte" do áudio — bom palpite para o refrão. */
export const bestWindow = (pcm, seconds, rate = PCM_RATE) => {
  const step = Math.floor(rate / 2);
  const blocks = Math.floor(pcm.length / step);
  const width = Math.max(1, Math.round((seconds * rate) / step));
  if (blocks <= width) return 0;
  const energy = new Float64Array(blocks);
  for (let b = 0; b < blocks; b++) {
    let sum = 0;
    for (let i = b * step, end = i + step; i < end; i++) sum += pcm[i] * pcm[i];
    energy[b] = sum;
  }
  const total = blocks * 0.5;
  const margin = total > seconds + 20 ? 10 : 0;
  const first = Math.floor(margin * 2);
  const last = blocks - width - Math.floor(margin * 2);
  let win = 0;
  for (let b = first; b < first + width; b++) win += energy[b];
  let best = win;
  let bestAt = first;
  for (let b = first + 1; b <= last; b++) {
    win += energy[b + width - 1] - energy[b - 1];
    if (win > best) { best = win; bestAt = b; }
  }
  return bestAt * 0.5;
};

/** 64 valores (0-100) — as barrinhas da nota de voz. */
export const waveform = (pcm, bars = 64) => {
  const out = Buffer.alloc(bars);
  if (!pcm.length) return out;
  const per = Math.max(1, Math.floor(pcm.length / bars));
  const peaks = [];
  for (let b = 0; b < bars; b++) {
    let peak = 0;
    for (let i = b * per, end = Math.min(pcm.length, i + per); i < end; i++) peak = Math.max(peak, Math.abs(pcm[i]));
    peaks.push(peak);
  }
  const max = Math.max(...peaks) || 1;
  peaks.forEach((p, i) => { out[i] = Math.round((p / max) * 100); });
  return out;
};

export const clampSeconds = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_SECONDS;
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, Math.round(n)));
};

/** "1:05", "01:02:03", "65", "65s" → segundos; inválido → null. */
export const parseTime = (text) => {
  const raw = String(text ?? '').trim().toLowerCase().replace(/s$/, '');
  if (!raw) return null;
  if (/^\d+(\.\d+)?$/.test(raw)) return Number(raw);
  if (!/^\d{1,2}(:\d{1,2}){1,2}$/.test(raw)) return null;
  return raw.split(':').reduce((t, p) => t * 60 + Number(p), 0);
};

/**
 * Argumentos do comando:  ""  |  "8"  |  "0:30 8"  (início duração)
 * @returns {{ start: number|null, seconds: number|null }}  null = automático
 */
export const parseArgs = (text) => {
  const parts = String(text || '').trim().split(/\s+/).filter((t) => /^\d/.test(t));
  if (!parts.length) return { start: null, seconds: null };
  if (parts.length === 1) {
    const s = parseTime(parts[0]);
    if (s === null) throw new SoundStickerError('Duração inválida. Exemplo: 15 (segundos)');
    return { start: null, seconds: clampSeconds(s) };
  }
  const start = parseTime(parts[0]);
  const secs = parseTime(parts[1]);
  if (start === null || secs === null) throw new SoundStickerError('Formato inválido. Exemplo: 0:30 8 (começa em 0:30, dura 8s)');
  return { start, seconds: clampSeconds(secs) };
};

/**
 * Prepara o som: corta, fade, normaliza o volume e converte para Opus mono (formato de nota de voz).
 * @param buffer  áudio OU vídeo (mp3, ogg, m4a, mp4...)
 * @param ext     extensão do arquivo ('ogg', 'mp3', 'm4a', 'mp4')
 * @param opts    { start, seconds } — start null = automático (áudio longo: pega o trecho mais forte)
 * @returns {{ ogg: Buffer, seconds: number, waveform: Buffer, start: number, total: number }}
 */
export const prepareClip = async (buffer, ext = 'ogg', { start = null, seconds = null } = {}) => {
  const pcm = await decodePcm(buffer, ext);
  const total = pcm.length / PCM_RATE;
  if (total < 0.5) throw new SoundStickerError('Esse áudio está vazio ou curto demais.');
  const length = seconds ? clampSeconds(seconds) : Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, Math.ceil(total)));
  const auto = start === null || start === undefined;
  let from = auto ? bestWindow(pcm, length) : Math.max(0, Number(start));
  if (from >= total) throw new SoundStickerError(`O áudio tem só ${Math.floor(total)}s. Escolha um início menor.`);
  const duration = Math.min(length, total - from);
  from = Math.round(from * 10) / 10;
  const fadeOut = Math.max(0, duration - 0.5).toFixed(2);

  const ogg = await convert(buffer, ext, 'ogg', (i, o) => [
    '-ss', String(from), '-t', duration.toFixed(2), '-i', i, '-vn',
    '-af', `afade=t=in:d=0.1,afade=t=out:st=${fadeOut}:d=0.5,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000`,
    '-ac', '1', '-ar', '48000', '-c:a', 'libopus', '-b:a', '48k', '-application', 'audio', '-f', 'ogg', o
  ]);

  const slice = pcm.subarray(Math.floor(from * PCM_RATE), Math.floor((from + duration) * PCM_RATE));
  return { ogg, seconds: Math.max(1, Math.round(duration)), start: from, total, waveform: waveform(slice), auto };
};

/* ------------------------------------------------------------------ */
/* 3) Capa                                                             */
/* ------------------------------------------------------------------ */

/** Capa 512x512 (webp) com a onda do som. Não usa texto (não depende de fontes). */
export const makeCover = async (wave = Buffer.alloc(64), palette = 0) => {
  const themes = [['#7c3aed', '#ec4899'], ['#0ea5e9', '#22c55e'], ['#f97316', '#ef4444'], ['#6366f1', '#14b8a6']];
  const [c1, c2] = themes[Math.abs(palette) % themes.length];
  const bars = 32, barW = 10, gap = 5;
  const totalW = bars * barW + (bars - 1) * gap;
  const x0 = (512 - totalW) / 2;
  let rects = '';
  for (let i = 0; i < bars; i++) {
    const v = Math.max(8, wave[Math.floor((i / bars) * wave.length)] ?? 20);
    const h = 20 + (v / 100) * 190;
    rects += `<rect x="${x0 + i * (barW + gap)}" y="${300 - h / 2}" width="${barW}" height="${h}" rx="5" fill="#ffffff" fill-opacity="0.95"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect x="8" y="8" width="496" height="496" rx="96" fill="url(#g)"/>
  <g transform="translate(256 118)">
    <circle r="44" fill="#ffffff" fill-opacity="0.22"/>
    <path d="M-22 -10 h12 l16 -14 v48 l-16 -14 h-12 z" fill="#ffffff"/>
    <path d="M14 -12 q12 12 0 24" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M22 -22 q22 22 0 44" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  ${rects}
</svg>`;
  return sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer();
};

/** Usa uma imagem sua como capa: 512x512 com fundo transparente. */
export const coverFromImage = async (imageBuffer) =>
  sharp(imageBuffer, { animated: false })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85 })
    .toBuffer();

/* ------------------------------------------------------------------ */
/* 4) Envio                                                            */
/* ------------------------------------------------------------------ */

const isAnimatedWebp = (buf) => buf.includes(Buffer.from('ANIM'));

/**
 * Envia UMA figurinha com som.
 * @param sock   socket do Baileys (o "conn"/"sock"/"client" do seu bot)
 * @param jid    chat de destino
 * @param opts   { webp: Buffer, clip: retorno de prepareClip, quoted?: mensagem citada, mentions?: [jids] }
 */
export const sendSoundSticker = async (sock, jid, { webp, clip, quoted, mentions, contextInfo } = {}) => {
  await autoLoadBaileys();
  if (!installStickerAudioProtocol()) {
    throw new SoundStickerError('Essa versão do Baileys não suporta figurinha com som.');
  }
  if (!webp?.length) throw new SoundStickerError('Figurinha vazia.');
  if (!clip?.ogg?.length) throw new SoundStickerError('Som vazio.');
  const { prepareWAMessageMedia, generateWAMessageFromContent } = B;
  const options = { upload: sock.waUploadToServer, mediaUploadTimeoutMs: 30_000 };
  let size = 512;
  try { const m = await sharp(webp).metadata(); if (m?.width) size = m.width; } catch { }
  const [sticker, audio] = await Promise.all([
    prepareWAMessageMedia({ sticker: webp, width: size, height: size }, options),
    prepareWAMessageMedia({
      audio: clip.ogg,
      mimetype: 'audio/ogg; codecs=opus',
      seconds: clip.seconds,
      ptt: true,
      waveform: clip.waveform || Buffer.alloc(64)
    }, options)
  ]);
  sticker.stickerMessage.audioMessage = audio.audioMessage;
  if (isAnimatedWebp(webp)) sticker.stickerMessage.isAnimated = true;

  // 1) monta como figurinha comum (id, resposta/citação etc.)
  const built = generateWAMessageFromContent(jid, sticker, { userJid: sock.user?.id, ...(quoted ? { quoted } : {}) });
  const inner = built.message.stickerMessage;
  if (contextInfo || mentions?.length) {
    inner.contextInfo = {
      ...(inner.contextInfo || {}),
      ...(contextInfo || {}),
      ...(mentions?.length ? { mentionedJid: mentions } : {})
    };
  }

  // 2) embrulha em audioStickerMessage (o stickerMessage solto é só marcador; não vai para o fio)
  const wrapped = { audioStickerMessage: { message: { stickerMessage: inner } }, stickerMessage: inner };
  await sock.relayMessage(jid, wrapped, { messageId: built.key.id });
  built.message = { audioStickerMessage: wrapped.audioStickerMessage };
  return built;
};

/* ------------------------------------------------------------------ */
/* 5) Ler figurinhas com som recebidas                                  */
/* ------------------------------------------------------------------ */

/** Pega a figurinha (comum OU com som) de dentro de uma mensagem / mensagem citada. */
export const stickerOf = (msg) =>
  msg?.stickerMessage || msg?.audioStickerMessage?.message?.stickerMessage || null;

/** A figurinha tem som? */
export const hasSound = (msg) => !!stickerOf(msg)?.audioMessage;

/** Monta o "clip" a partir do audioMessage de uma figurinha + o áudio já baixado. */
export const clipFromAudioMessage = (audioMessage, oggBuffer) => ({
  ogg: oggBuffer,
  seconds: Math.max(1, Number(audioMessage?.seconds) || 1),
  waveform: audioMessage?.waveform?.length ? Buffer.from(audioMessage.waveform) : Buffer.alloc(64)
});

/** Baixa uma mídia (imageMessage, videoMessage, audioMessage, stickerMessage) para Buffer. */
export const downloadMedia = async (mediaMessage, type) => {
  await autoLoadBaileys();
  const stream = await B.downloadContentFromMessage(mediaMessage, type);
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
};

/** Baixa o som de uma figurinha com som → clip (ou null se ela não tiver som). */
export const getStickerSound = async (stickerMessage) => {
  if (!stickerMessage?.audioMessage) return null;
  try {
    const ogg = await downloadMedia(stickerMessage.audioMessage, 'audio');
    return ogg.length ? clipFromAudioMessage(stickerMessage.audioMessage, ogg) : null;
  } catch (e) {
    console.error('[FIG-SOM] Não consegui baixar o som da figurinha:', e?.message || e);
    return null;
  }
};

/** Resumo legível de uma figurinha (para diagnóstico). */
export const describeSoundSticker = (msg) => {
  const st = stickerOf(msg);
  if (!st) return null;
  const hide = (k, v) => (Buffer.isBuffer(v) || v instanceof Uint8Array || (v && v.type === 'Buffer'))
    ? `<${v.length ?? v.data?.length} bytes>` : v;
  return JSON.stringify({
    embrulhada: !!msg?.audioStickerMessage,
    sticker: { ...st, audioMessage: undefined, contextInfo: undefined },
    audio: st.audioMessage || null
  }, hide, 2);
};
