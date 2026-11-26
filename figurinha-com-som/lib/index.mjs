/**
 * ============================================================
 *  FIGURINHA COM SOM — API PRONTA (é só chamar no seu comando)
 *  Extraído do bot ★彡 ASTA MD 彡★ — ★彡 GEOVANE MD 彡★
 * ============================================================
 *
 *  import { figurinha, refazerFigurinha, trocarPacote } from './figurinha-com-som/lib/index.mjs';
 *
 *  // no comando .s / .sticker:
 *  await figurinha(sock, msg, { args: textoDepoisDoComando, packname: 'Meu Bot', author: msg.pushName });
 *
 *  O que o .s faz:
 *   • responder um ÁUDIO / nota de voz / música  → figurinha com som (capa automática com a onda)
 *       (mande uma IMAGEM com legenda .s respondendo o áudio → a imagem vira a capa)
 *   • vídeo COM som                               → figurinha animada COM o som do vídeo
 *   • vídeo sem som / GIF / imagem                → figurinha comum
 *   • responder uma FIGURINHA (com ou sem som)    → refaz a figurinha mantendo o som
 *   • opções no texto: "15" (dura 15s) | "1:05 10" (começa em 1:05, dura 10s) | "mudo" | "circulo"
 */
import {
  prepareClip, makeCover, coverFromImage, sendSoundSticker, parseArgs, parseTime, setSoundLimits,
  SoundStickerError, stickerOf, getStickerSound, downloadMedia, useBaileys, stickerAudioReady, MAX_SECONDS
} from './soundSticker.mjs';
import { toWebp, trimMedia, writeExif, stickerToVideo, isAnimated, hasAudioTrack, configureEncoder, settings as encoderSettings } from './stickerEncoder.mjs';

export * from './soundSticker.mjs';
export * from './stickerEncoder.mjs';

/** Remove os "embrulhos" (visualização única, mensagem temporária, editada...). */
export const unwrapMessage = (m) => {
  let x = m;
  for (let i = 0; i < 6 && x; i++) {
    const inner = x.ephemeralMessage?.message || x.viewOnceMessage?.message || x.viewOnceMessageV2?.message ||
      x.viewOnceMessageV2Extension?.message || x.documentWithCaptionMessage?.message || x.editedMessage?.message;
    if (!inner) break;
    x = inner;
  }
  return x || {};
};

/** Mensagem citada (respondida) de qualquer tipo de mensagem. */
export const quotedOf = (msg) => {
  const m = unwrapMessage(msg?.message);
  for (const k of Object.keys(m)) {
    const q = m[k]?.contextInfo?.quotedMessage;
    if (q) return unwrapMessage(q);
  }
  return null;
};

const extOfAudio = (mime = '') => (/mpeg|mp3/i.test(mime) ? 'mp3' : /mp4|m4a|aac/i.test(mime) ? 'm4a' : /wav/i.test(mime) ? 'wav' : 'ogg');

/** Envia uma figurinha (com som se `clip` existir). */
async function deliver(sock, jid, webp, clip, quoted) {
  if (clip) return sendSoundSticker(sock, jid, { webp, clip, quoted });
  return sock.sendMessage(jid, { sticker: webp }, { quoted });
}

/**
 * Refaz uma figurinha (comum ou com som) mudando formato/pacote, SEM perder o som.
 * Use em: take/rename, redonda, quadrada, legenda etc.
 * @param stickerMessage  a figurinha (use stickerOf(mensagemCitada))
 * @param opts { quoted, packname, author, circle, square, transform (opcional: async (mp4|png, isVideo) => Buffer, ex.: pôr legenda), maxSeconds }
 */
export async function refazerFigurinha(sock, jid, stickerMessage, { quoted, packname = '', author = '', circle = false, square = true, transform = null, maxSeconds = 30 } = {}) {
  const webpIn = await downloadMedia(stickerMessage, 'sticker');
  const clip = await getStickerSound(stickerMessage);
  const exif = (b) => (packname || author ? writeExif(b, { packname, author }) : b);
  if (!(await isAnimated(webpIn))) {
    if (!circle && !transform) return deliver(sock, jid, await exif(webpIn), clip, quoted);
    const sharp = (await import('sharp')).default;
    let png = await sharp(webpIn).png().toBuffer();
    if (transform) png = await transform(png, false);
    return deliver(sock, jid, await exif(await toWebp(png, { circle, square })), clip, quoted);
  }
  if (!circle && !transform && square) return deliver(sock, jid, await exif(webpIn), clip, quoted);
  const vid = await stickerToVideo(webpIn, clip?.ogg || null);
  let mp4 = vid.video;
  if (transform) mp4 = await transform(mp4, true);
  const secs = clip ? Math.min(maxSeconds, clip.seconds) : Math.max(1, Math.min(maxSeconds, Math.round(vid.frames / Math.max(1, vid.fps))));
  const w = await toWebp(mp4, { video: true, seconds: Math.ceil(secs), square, circle });
  return deliver(sock, jid, await exif(w), clip, quoted);
}

/** Só troca o nome do pacote/autor (take / rename) mantendo o som. */
export async function trocarPacote(sock, jid, stickerMessage, { quoted, packname = '', author = '' } = {}) {
  const webpIn = await downloadMedia(stickerMessage, 'sticker');
  const clip = await getStickerSound(stickerMessage);
  return deliver(sock, jid, await writeExif(webpIn, { packname, author }), clip, quoted);
}

/**
 * O comando .s completo.
 * @param sock  socket do Baileys
 * @param msg   a mensagem recebida (objeto do evento messages.upsert)
 * @param opts  { args: texto depois do comando, packname, author, maxSeconds (padrão 30), circle (força redonda), square (padrão true) }
 * @returns {Promise<{ ok: boolean, tipo?: string, erro?: string }>}  erro = texto pronto para responder ao usuário
 */
export async function figurinha(sock, msg, { args = '', packname = '', author = '', maxSeconds = 30, circle = false, square = true } = {}) {
  const jid = msg.key.remoteJid;
  const own = unwrapMessage(msg.message);
  const quoted = quotedOf(msg);
  const opts = String(args || '').toLowerCase();
  const wantCircle = circle || /c[ií]rculo|circle|redond/.test(opts);
  const mute = /\bmudo\b|\bmute\b|semsom|sem som/.test(opts);
  setSoundLimits({ maxSeconds });
  const exif = (b) => (packname || author ? writeExif(b, { packname, author }) : b);

  try {
    // 1) respondeu um ÁUDIO → figurinha com som
    const audio = quoted?.audioMessage;
    if (audio) {
      if (Number(audio.fileLength) > 25 * 1024 * 1024) return { ok: false, erro: 'Esse áudio é grande demais (máx. 25MB).' };
      const clip = await prepareClip(await downloadMedia(audio, 'audio'), extOfAudio(audio.mimetype), parseArgs(opts));
      const cover = own.imageMessage
        ? await coverFromImage(await downloadMedia(own.imageMessage, 'image'))
        : await makeCover(clip.waveform, Math.floor(Math.random() * 4));
      await sendSoundSticker(sock, jid, { webp: await exif(cover), clip, quoted: msg });
      return { ok: true, tipo: 'audio' };
    }

    const image = own.imageMessage || quoted?.imageMessage;
    const video = own.videoMessage || quoted?.videoMessage;

    // 2) respondeu uma FIGURINHA → refaz mantendo o som
    if (!image && !video) {
      const st = stickerOf(quoted);
      if (st) {
        await refazerFigurinha(sock, jid, st, { quoted: msg, packname, author, circle: wantCircle, square, maxSeconds });
        return { ok: true, tipo: 'figurinha' };
      }
      return { ok: false, erro: 'Marque uma imagem, um vídeo, um áudio ou uma figurinha.' };
    }

    // 3) imagem → figurinha comum
    if (image) {
      const webp = await toWebp(await downloadMedia(image, 'image'), { square, circle: wantCircle });
      await sock.sendMessage(jid, { sticker: await exif(webp) }, { quoted: msg });
      return { ok: true, tipo: 'imagem' };
    }

    // 4) vídeo → figurinha animada (com o som do vídeo, se tiver)
    let buf = await downloadMedia(video, 'video');
    const total = Number(video.seconds) || 0;
    const times = opts.split(/\s+/).filter((t) => /^\d{1,2}(:\d{1,2}){0,2}s?$/.test(t));
    let start = 0, dur = null;
    if (times.length === 1) dur = parseTime(times[0]);
    if (times.length >= 2) { start = parseTime(times[0]) || 0; dur = parseTime(times[1]); }
    if (total && start >= total) return { ok: false, erro: `O vídeo tem só ${Math.floor(total)}s. Escolha um início menor.` };
    const rest = total ? total - start : maxSeconds;
    const secs = Math.max(1, Math.min(maxSeconds, dur || rest, rest || maxSeconds));
    if (start > 0 || (total && total > secs + 0.5)) buf = await trimMedia(buf, start, secs);

    const webp = await exif(await toWebp(buf, { video: true, seconds: Math.ceil(secs), square, circle: wantCircle }));
    if (!mute && !video.gifPlayback && await hasAudioTrack(buf)) {
      try {
        const clip = await prepareClip(buf, 'mp4', { start: 0, seconds: Math.ceil(secs) });
        await sendSoundSticker(sock, jid, { webp, clip, quoted: msg });
        return { ok: true, tipo: 'video-com-som' };
      } catch (e) {
        if (encoderSettings.debug) console.log('[FIG-SOM] vídeo sem som utilizável:', e.message);
      }
    }
    await sock.sendMessage(jid, { sticker: webp }, { quoted: msg });
    return { ok: true, tipo: 'video' };
  } catch (e) {
    if (e instanceof SoundStickerError) return { ok: false, erro: e.message };
    console.error('[FIG-SOM] erro:', e);
    return { ok: false, erro: 'Não consegui fazer a figurinha. Tente de novo.' };
  }
}

/**
 * Para o AUTOSTICKER: transforma a mídia da própria mensagem em figurinha (vídeo com som → figurinha com som).
 * Retorna false se a mensagem não tiver imagem/vídeo.
 */
export async function autoFigurinha(sock, msg, opts = {}) {
  const own = unwrapMessage(msg.message);
  if (!own.imageMessage && !own.videoMessage) return false;
  const r = await figurinha(sock, { ...msg, message: { ...(own.imageMessage ? { imageMessage: own.imageMessage } : { videoMessage: own.videoMessage }) } }, opts);
  return r.ok;
}

export { useBaileys, stickerAudioReady, configureEncoder };
