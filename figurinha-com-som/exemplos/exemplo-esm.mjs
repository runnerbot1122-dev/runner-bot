/**
 * EXEMPLO — bot em ESM (package.json com "type": "module" ou arquivos .mjs)
 * Mostra só a parte dos comandos. Adapte ao "case" / handler do seu bot.
 */
import * as baileys from 'baileys'; // ou '@whiskeysockets/baileys' — use o MESMO do seu bot
import {
  useBaileys, figurinha, trocarPacote, refazerFigurinha, autoFigurinha,
  stickerOf, quotedOf, getStickerSound, configureEncoder
} from '../lib/index.mjs';

useBaileys(baileys);                 // garante que o patch usa o mesmo Baileys do bot
configureEncoder({ fps30UpTo: 15 }); // opcional: vídeos até 15s saem a 30 fps

const PREFIXO = '.';
const NOME_BOT = 'Meu Bot';

export async function onMessage(sock, msg) {
  const m = msg.message || {};
  const texto = m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || '';
  if (!texto.startsWith(PREFIXO)) return;
  const [cmd, ...resto] = texto.slice(PREFIXO.length).trim().split(/\s+/);
  const args = resto.join(' ');
  const jid = msg.key.remoteJid;
  const responder = (t) => sock.sendMessage(jid, { text: t }, { quoted: msg });

  switch (cmd.toLowerCase()) {
    // .s  → áudio vira figurinha com som, vídeo com som vira figurinha animada com som
    case 's':
    case 'sticker':
    case 'sc': {
      const r = await figurinha(sock, msg, {
        args,
        packname: NOME_BOT,
        author: msg.pushName || '',
        circle: cmd === 'sc',
        maxSeconds: 30
      });
      if (!r.ok) await responder('❌ ' + r.erro);
      break;
    }

    // .take Pacote|Autor  → troca o nome da figurinha SEM perder o som
    case 'take':
    case 'rename': {
      const st = stickerOf(quotedOf(msg));
      if (!st) return responder('Responda uma figurinha.');
      const [pack, autor] = args.split('|').map((s) => s?.trim());
      await trocarPacote(sock, jid, st, { quoted: msg, packname: pack || NOME_BOT, author: autor || msg.pushName || '' });
      break;
    }

    // .somfig → manda o som de uma figurinha como nota de voz
    case 'somfig': {
      const st = stickerOf(quotedOf(msg));
      const clip = st && await getStickerSound(st);
      if (!clip) return responder('Responda uma figurinha COM som.');
      await sock.sendMessage(jid, { audio: clip.ogg, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });
      break;
    }
  }
}

// AUTOSTICKER (se o seu bot tiver): chame para mensagens com imagem/vídeo, sem comando
export async function onAutoSticker(sock, msg) {
  await autoFigurinha(sock, msg, { packname: NOME_BOT, author: msg.pushName || '' });
}
