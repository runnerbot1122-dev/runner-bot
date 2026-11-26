/**
 * ============================================================
 *  CONVERSOR DE FIGURINHAS (imagem e vídeo → webp) — nítido e fluido
 *  Extraído do bot ★彡 ASTA MD 彡★
 * ============================================================
 * - Imagem: 512x512, qualidade alta.
 * - Vídeo: figurinha animada que SEMPRE cabe no limite de ~1MB do WhatsApp
 *   (acima disso a figurinha trava ou não toca). O conversor faz uma amostra
 *   curta, estima o "peso" do vídeo e escolhe a melhor combinação de
 *   resolução (até 512px) × fps (até 30) × qualidade, sem pixelar.
 * - Também: cortar trecho, legenda estilo meme, EXIF (nome do pacote/autor),
 *   e figurinha animada → vídeo MP4 (para refazer figurinhas sem perder o som).
 *
 * Requisitos: ffmpeg no PATH (com libwebp), "sharp" e "node-webpmux".
 */
import fs from 'fs/promises';
import { spawnSync } from 'child_process';
import sharp from 'sharp';
import webpmux from 'node-webpmux';
import { runFfmpeg, tmpFile } from './soundSticker.mjs';

/* ------------------------------------------------------------------ */
/* Configuração                                                         */
/* ------------------------------------------------------------------ */

export const settings = {
  /** limite de tamanho da figurinha animada (bytes). WhatsApp: ~1MB */
  maxBytes: 990_000,
  /**
   * 'qualidade' (padrão) → nitidez primeiro; baixa o fps antes de pixelar
   * 'auto'               → equilíbrio
   * 'fixo'               → fps nunca baixa (use settings.fps)
   */
  mode: 'qualidade',
  /** no modo 'qualidade', vídeos até N segundos saem SEMPRE a 30 fps (sem pixelar) */
  fps30UpTo: 15,
  /** fps do modo 'fixo' */
  fps: 30,
  /** mostra no console cada tentativa de conversão */
  debug: false
};
export const configureEncoder = (opts = {}) => Object.assign(settings, opts);

/* ------------------------------------------------------------------ */

let _enc = null;
function animEncoder() {
  if (_enc) return _enc;
  try {
    const r = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8', timeout: 15000 });
    // libwebp_anim guarda só o que muda entre os quadros (fica bem menor)
    _enc = /libwebp_anim/.test(r.stdout || '') ? 'libwebp_anim' : 'libwebp';
  } catch { _enc = 'libwebp'; }
  return _enc;
}

const circleFilter = (size) =>
  `crop='min(iw,ih)':'min(iw,ih)',scale=${size}:${size},format=rgba,` +
  `geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(W/2-hypot(X-W/2+0.5,Y-H/2+0.5),0,1)'`;

const scaleFilter = (size, square, circle) => circle
  ? circleFilter(size)
  : square
    ? `scale=${size}:${size}:flags=lanczos`
    : `scale=${size}:${size}:flags=lanczos:force_original_aspect_ratio=decrease,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba`;

async function encodeAnim(tmpIn, dur, size, fps, q, square, circle) {
  const out = tmpFile('webp');
  try {
    await runFfmpeg([
      '-i', tmpIn, '-t', String(dur),
      '-vf', `fps=${fps},${scaleFilter(size, square, circle)}`,
      '-c:v', animEncoder(), '-lossless', '0', '-q:v', String(q),
      '-compression_level', '4', '-loop', '0', '-an', '-f', 'webp', out
    ]);
    const buf = await fs.readFile(out);
    if (!buf.length) throw new Error('Conversão falhou: saída vazia');
    return buf;
  } finally { fs.unlink(out).catch(() => {}); }
}

// curva qualidade → tamanho medida com libwebp_anim (q50 = 1)
const Q_CURVE = [[5, 0.39], [10, 0.45], [20, 0.58], [30, 0.71], [40, 0.86], [50, 1.0], [60, 1.15], [70, 1.35], [80, 1.84], [90, 2.97]];
const qFactor = (q) => {
  if (q <= Q_CURVE[0][0]) return Q_CURVE[0][1];
  for (let i = 1; i < Q_CURVE.length; i++) {
    const [q1, f1] = Q_CURVE[i - 1], [q2, f2] = Q_CURVE[i];
    if (q <= q2) return f1 + (f2 - f1) * (q - q1) / (q2 - q1);
  }
  return Q_CURVE[Q_CURVE.length - 1][1];
};
// tamanho ∝ lado^1.09 × fps^0.73 × curva(qualidade)
const animModel = (size, fps, q) => Math.pow(size, 1.09) * Math.pow(fps, 0.73) * qFactor(q);

const PASSES = {
  'fixo-hd': (f) => [[75, 512], [65, 448], [60, 384], [58, 352], [55, 320], [52, 288], [46, 256], [42, 240], [38, 224], [34, 208], [28, 192], [10, 160]].map(([qmin, smin]) => ({ qmin, smin, fmin: f })),
  fixo: (f) => [[35, 256], [20, 224], [15, 192], [10, 160], [5, 128]].map(([qmin, smin]) => ({ qmin, smin, fmin: f })),
  auto: (f) => [{ qmin: 60, smin: 448, fmin: f }, { qmin: 50, smin: 320, fmin: f }, { qmin: 35, smin: 256, fmin: f }, { qmin: 20, smin: 224, fmin: Math.min(f, 20) }, { qmin: 25, smin: 224, fmin: 15 }, { qmin: 20, smin: 192, fmin: 12 }, { qmin: 10, smin: 160, fmin: 10 }],
  qualidade: () => [[75, 512, 20], [70, 448, 15], [65, 384, 15], [65, 320, 15], [60, 384, 12], [55, 320, 12], [50, 320, 10], [50, 288, 8], [45, 256, 8], [38, 240, 6], [25, 192, 6], [10, 160, 6]].map(([qmin, smin, fmin]) => ({ qmin, smin, fmin }))
};
const SIZES = [512, 480, 448, 416, 384, 352, 320, 288, 256, 240, 224, 208, 192, 176, 160, 144, 128];
const QS = [90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 42, 38, 35, 30, 25, 20, 15, 10, 5];

function pickParams(k, fpsTarget, tried, mode) {
  const fixed = mode === 'fixo' || mode === 'fixo-hd';
  const fpsList = fixed ? [fpsTarget] : [30, 25, 24, 20, 15, 12, 10, 8, 6].filter((f) => f <= fpsTarget);
  for (const pass of PASSES[mode](fpsTarget)) {
    for (const f of fpsList.filter((x) => x >= pass.fmin)) {
      for (const sz of SIZES.filter((x) => x >= pass.smin)) {
        for (const q of QS.filter((x) => x >= pass.qmin)) {
          if (tried.has(`${sz}/${f}/${q}`)) continue;
          if (k * animModel(sz, f, q) <= settings.maxBytes * 0.95) return { size: sz, fps: f, q };
        }
      }
    }
  }
  return fixed ? { size: 160, fps: fpsTarget, q: 10 } : { size: 160, fps: 6, q: 10 };
}

async function videoToAnimatedWebp(tmpIn, seconds, square, circle) {
  const dur = Math.max(1, Math.min(60, Number(seconds) || 8));
  let mode = settings.mode;
  let fpsFixed = settings.fps;
  if (mode === 'qualidade' && dur <= settings.fps30UpTo) { mode = 'fixo-hd'; fpsFixed = 30; }
  const fixed = mode === 'fixo' || mode === 'fixo-hd';
  const fpsTarget = fixed ? Math.min(30, Math.max(6, fpsFixed)) : (dur <= 6 ? 30 : dur <= 10 ? 24 : mode === 'auto' ? 20 : 25);
  const tried = new Set();
  const choose = (k) => pickParams(k, fpsTarget, tried, mode);

  // amostra curta para estimar o "peso" deste vídeo
  const probeDur = Math.min(dur, 2.5);
  const startFps = fixed ? fpsTarget : Math.min(fpsTarget, dur <= 6 ? 30 : dur <= 10 ? 24 : 15);
  let k;
  try {
    const probe = await encodeAnim(tmpIn, probeDur, 512, startFps, 70, square, circle);
    k = (probe.length * (dur / probeDur)) / animModel(512, startFps, 70);
  } catch { k = 1e9; }

  let p = choose(k), best = null, smallest = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    tried.add(`${p.size}/${p.fps}/${p.q}`);
    const buf = await encodeAnim(tmpIn, dur, p.size, p.fps, p.q, square, circle);
    if (settings.debug) console.log(`  tentativa ${attempt + 1}: ${p.size}px ${p.fps}fps q${p.q} = ${(buf.length / 1024).toFixed(0)}KB`);
    if (!smallest || buf.length < smallest.buf.length) smallest = { buf, p };
    k = buf.length / animModel(p.size, p.fps, p.q);
    if (buf.length <= settings.maxBytes) {
      best = { buf, p };
      // sobrou espaço? tenta uma vez algo mais nítido
      if (buf.length < settings.maxBytes * 0.8 && attempt < 3) {
        const up = choose(k * 1.04);
        const sharpness = (x) => Math.min(x.q, 80) * Math.sqrt(x.size) + (x.fps >= p.fps ? 0 : -1e6);
        if (sharpness(up) > sharpness(p) * 1.05) {
          tried.add(`${up.size}/${up.fps}/${up.q}`);
          const b2 = await encodeAnim(tmpIn, dur, up.size, up.fps, up.q, square, circle).catch(() => null);
          if (settings.debug && b2) console.log(`  melhoria: ${up.size}px ${up.fps}fps q${up.q} = ${(b2.length / 1024).toFixed(0)}KB`);
          if (b2 && b2.length <= settings.maxBytes) best = { buf: b2, p: up };
        }
      }
      break;
    }
    p = choose(k * 1.03);
  }
  const out = best || smallest;
  if (settings.debug) console.log(`[FIGURINHA] ${out.p.size}px ${out.p.fps}fps q${out.p.q} -> ${(out.buf.length / 1024).toFixed(0)}KB (${dur}s)`);
  return out.buf;
}

const detectExt = (buf) => {
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  if (buf.slice(0, 3).toString() === 'GIF') return 'gif';
  return 'jpg';
};

/**
 * Converte imagem ou vídeo em figurinha webp.
 * @param buffer   imagem (jpg/png/webp/gif) ou vídeo (mp4...)
 * @param opts     { video: bool, seconds: duração (vídeo), square: esticar em quadrado (true) ou manter proporção (false), circle: redonda }
 */
export async function toWebp(buffer, { video = false, seconds = 8, square = true, circle = false } = {}) {
  if (!video && !circle && detectExt(buffer) === 'webp') return buffer;
  const tmpIn = tmpFile(video ? 'mp4' : detectExt(buffer));
  await fs.writeFile(tmpIn, buffer);
  try {
    if (video) return await videoToAnimatedWebp(tmpIn, seconds, square, circle);
    let q = 90, out = null;
    for (let i = 0; i < 6; i++) {
      const tmpOut = tmpFile('webp');
      try {
        await runFfmpeg(['-i', tmpIn, '-vf', scaleFilter(512, square, circle), '-frames:v', '1', '-c:v', 'libwebp', '-lossless', '0', '-compression_level', '6', '-q:v', String(q), '-f', 'webp', tmpOut]);
        out = await fs.readFile(tmpOut);
      } finally { fs.unlink(tmpOut).catch(() => {}); }
      if (out.length <= 500_000 || q <= 30) break;
      q -= 15;
    }
    return out;
  } finally { fs.unlink(tmpIn).catch(() => {}); }
}

/** Corta um trecho do vídeo (mantém o áudio). */
export async function trimMedia(buffer, start = 0, duration = 8) {
  const tmpIn = tmpFile('mp4'), tmpOut = tmpFile('mp4');
  await fs.writeFile(tmpIn, buffer);
  try {
    await runFfmpeg(['-ss', String(Math.max(0, start)), '-i', tmpIn, '-t', String(Math.max(0.5, duration)),
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', tmpOut]);
    return await fs.readFile(tmpOut);
  } finally { fs.unlink(tmpIn).catch(() => {}); fs.unlink(tmpOut).catch(() => {}); }
}

/** Duração (s) de um vídeo/áudio usando ffprobe (0 se não conseguir). */
export async function mediaDuration(buffer) {
  const tmp = tmpFile('mp4');
  await fs.writeFile(tmp, buffer);
  try {
    const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', tmp], { encoding: 'utf8', timeout: 20000 });
    return Number(String(r.stdout).trim()) || 0;
  } finally { fs.unlink(tmp).catch(() => {}); }
}

/** O vídeo tem faixa de áudio? */
export async function hasAudioTrack(buffer) {
  const tmp = tmpFile('mp4');
  await fs.writeFile(tmp, buffer);
  try {
    const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', tmp], { encoding: 'utf8', timeout: 20000 });
    return String(r.stdout).trim().length > 0;
  } finally { fs.unlink(tmp).catch(() => {}); }
}

/** Grava nome do pacote e autor na figurinha. */
export async function writeExif(webpBuffer, { packname = '', author = '', emojis = ['🔊'] } = {}) {
  try {
    const img = new webpmux.Image();
    await img.load(webpBuffer);
    const json = { 'sticker-pack-id': `fig-som-${Date.now()}`, 'sticker-pack-name': packname, 'sticker-pack-publisher': author, emojis };
    const head = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const body = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([head, body]);
    exif.writeUIntLE(body.length, 14, 4);
    img.exif = exif;
    return await img.save(null);
  } catch { return webpBuffer; }
}

/**
 * Figurinha animada → MP4 (o ffmpeg não lê webp animado, então os quadros saem pelo sharp).
 * audioBuffer opcional: junta o som (o vídeo repete até o fim do som).
 * @returns {{ video: Buffer, frames: number, fps: number }}
 */
export async function stickerToVideo(webpBuffer, audioBuffer = null) {
  const meta = await sharp(webpBuffer, { animated: true }).metadata();
  const pages = meta.pages || 1;
  const w = meta.width, h = meta.pageHeight || meta.height;
  const delays = (meta.delay?.length ? meta.delay : [100]).map((d) => (d > 0 ? d : 100));
  const fps = Math.max(1, Math.min(60, Math.round(1000 / (delays.reduce((a, b) => a + b, 0) / delays.length))));
  const raw = await sharp(webpBuffer, { animated: true }).flatten({ background: '#ffffff' }).raw().toBuffer();
  const W2 = w - (w % 2), H2 = h - (h % 2);
  const tmpRaw = tmpFile('rgb'), tmpAud = audioBuffer ? tmpFile('ogg') : null, tmpOut = tmpFile('mp4');
  await fs.writeFile(tmpRaw, raw);
  if (tmpAud) await fs.writeFile(tmpAud, audioBuffer);
  try {
    const args = ['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${w}x${h}`, '-r', String(fps)];
    if (tmpAud) args.push('-stream_loop', '-1');
    args.push('-i', tmpRaw);
    if (tmpAud) args.push('-i', tmpAud);
    args.push('-vf', `crop=${W2}:${H2}:0:0`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p');
    if (tmpAud) args.push('-c:a', 'aac', '-shortest');
    args.push('-movflags', '+faststart', tmpOut);
    await runFfmpeg(args);
    return { video: await fs.readFile(tmpOut), frames: pages, fps };
  } finally {
    for (const f of [tmpRaw, tmpAud, tmpOut].filter(Boolean)) fs.unlink(f).catch(() => {});
  }
}

/** A figurinha webp é animada? */
export async function isAnimated(webpBuffer) {
  try { return ((await sharp(webpBuffer, { animated: true }).metadata()).pages || 1) > 1; } catch { return false; }
}
