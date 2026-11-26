/**
 * TESTE LOCAL (não conecta no WhatsApp)
 *   node figurinha-com-som/teste.mjs
 * Confere: ffmpeg, sharp, Baileys, o patch do protocolo e monta figurinhas com som de verdade
 * (áudio, vídeo com som, vídeo sem som, imagem e refazer figurinha com som).
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import { execFileSync } from 'child_process';
import * as kit from './lib/index.mjs';

const ok = (t) => console.log('  ✅ ' + t);
const fail = (t) => { console.log('  ❌ ' + t); process.exitCode = 1; };

console.log('\n🔎 1) Programas');
try { execFileSync('ffmpeg', ['-version']); ok('ffmpeg encontrado'); } catch { fail('ffmpeg NÃO encontrado (instale e coloque no PATH)'); process.exit(1); }
const enc = execFileSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' });
/libopus/.test(enc) ? ok('ffmpeg tem libopus (som)') : fail('ffmpeg SEM libopus — baixe uma versão "full"');
/libwebp/.test(enc) ? ok('ffmpeg tem libwebp (figurinha)') : fail('ffmpeg SEM libwebp — baixe uma versão "full"');

console.log('\n🔎 2) Protocolo da figurinha com som');
kit.stickerAudioReady() ? ok('patch do Baileys instalado') : fail('patch NÃO instalou (veja o TUTORIAL, seção "Problemas")');
const { proto, generateWAMessageContent } = await (async () => { for (const n of ['baileys', '@whiskeysockets/baileys', '@itsukichan/baileys', '@adiwajshing/baileys']) { try { const m = await import(n); return m.proto ? m : m.default; } catch { } } })();

// servidor falso de upload/download (simula o WhatsApp)
const store = new Map(); let n = 0;
const srv = http.createServer((q, r) => { const b = store.get(q.url); if (!b) { r.statusCode = 404; return r.end(); } r.end(b); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;
const readAll = async (s) => { if (typeof s === 'string') return fs.readFileSync(s); if (Buffer.isBuffer(s)) return s; const c = []; for await (const x of s) c.push(x); return Buffer.concat(c); };
const upload = async (src) => { const id = '/m/' + (++n); store.set(id, await readAll(src)); return { mediaUrl: `http://127.0.0.1:${port}${id}`, directPath: '' }; };

const sent = [];
const sock = {
  user: { id: '5500000000000:1@s.whatsapp.net' },
  waUploadToServer: upload,
  relayMessage: async (jid, m) => { const d = proto.Message.decode(proto.Message.encode(m).finish()); sent.push(d); },
  sendMessage: async (jid, c) => { sent.push({ plain: Object.keys(c)[0] }); return { key: { id: 'X' } }; }
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'figsom-'));
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a]);
ff('-f', 'lavfi', '-i', 'sine=f=440:d=5', '-c:a', 'libopus', path.join(tmp, 'a.ogg'));
ff('-f', 'lavfi', '-i', 'testsrc2=s=480x360:r=30:d=6', '-f', 'lavfi', '-i', 'sine=f=300:d=6', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-shortest', path.join(tmp, 'v.mp4'));
ff('-f', 'lavfi', '-i', 'testsrc2=s=480x360:r=30:d=4', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path.join(tmp, 'm.mp4'));
ff('-f', 'lavfi', '-i', 'testsrc2=s=640x480', '-frames:v', '1', path.join(tmp, 'i.png'));

const content = async (c) => generateWAMessageContent(c, { upload });
const audioMsg = await content({ audio: fs.readFileSync(path.join(tmp, 'a.ogg')), mimetype: 'audio/ogg; codecs=opus', ptt: true });
const videoMsg = await content({ video: fs.readFileSync(path.join(tmp, 'v.mp4')) }); videoMsg.videoMessage.seconds = 6;
const muteMsg = await content({ video: fs.readFileSync(path.join(tmp, 'm.mp4')) }); muteMsg.videoMessage.seconds = 4;
const imgMsg = await content({ image: fs.readFileSync(path.join(tmp, 'i.png')) });

const reply = (quoted) => ({ key: { remoteJid: '123@g.us', id: 'T' + (++n), participant: '55@s.whatsapp.net' }, pushName: 'Teste', message: { extendedTextMessage: { text: '.s', contextInfo: { quotedMessage: quoted } } } });
const own = (m) => ({ key: { remoteJid: '123@g.us', id: 'T' + (++n) }, message: m });
const check = (label, r, wantSound) => {
  const last = sent[sent.length - 1];
  const st = last?.audioStickerMessage?.message?.stickerMessage;
  if (!r.ok) return fail(`${label}: ${r.erro}`);
  if (wantSound && st?.audioMessage) ok(`${label} → figurinha COM som (${st.audioMessage.seconds}s${st.isAnimated ? ', animada' : ''})`);
  else if (!wantSound && last?.plain === 'sticker') ok(`${label} → figurinha comum`);
  else fail(`${label}: resultado inesperado`);
};

console.log('\n🔎 3) Comando .s (simulado)');
check('.s respondendo áudio', await kit.figurinha(sock, reply(audioMsg), { packname: 'Teste' }), true);
check('.s em vídeo com som', await kit.figurinha(sock, own(videoMsg)), true);
check('.s em vídeo sem som', await kit.figurinha(sock, own(muteMsg)), false);
check('.s mudo em vídeo com som', await kit.figurinha(sock, own(videoMsg), { args: 'mudo' }), false);
check('.s em imagem', await kit.figurinha(sock, own(imgMsg)), false);

// refazer figurinha com som (take / redonda) — usa a última figurinha com som enviada
const somFig = sent.filter((m) => m.audioStickerMessage).pop();
const quotedSom = { audioStickerMessage: somFig.audioStickerMessage };
check('.s circulo respondendo figurinha com som', await kit.figurinha(sock, reply(quotedSom), { args: 'circulo' }), true);
sent.length = 0;
await kit.trocarPacote(sock, '123@g.us', kit.stickerOf(quotedSom), { packname: 'Novo', author: 'Eu' });
sent.at(-1)?.audioStickerMessage?.message?.stickerMessage?.audioMessage ? ok('take/rename mantém o som') : fail('take/rename perdeu o som');

srv.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(process.exitCode ? '\n⚠️  Algo falhou — veja o TUTORIAL (seção Problemas).\n' : '\n🎉 Tudo certo! Pode usar no seu bot.\n');
process.exit(process.exitCode || 0);
