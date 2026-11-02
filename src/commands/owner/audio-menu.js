const fs = require('fs');
const path = require('path');
const ownerOnly = require('../../utils/ownerOnly');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const destination = path.join(process.cwd(), 'assets', 'menus', 'audio-menu.ogg');
async function collect(stream, maxBytes = 15 * 1024 * 1024) {
  const chunks = []; let total = 0;
  for await (const chunk of stream) { total += chunk.length; if (total > maxBytes) throw new Error('AUDIO_TOO_LARGE'); chunks.push(chunk); }
  return Buffer.concat(chunks);
}
module.exports = {
  name: ['audio-menu', 'audiomenu'], description: 'Define o áudio reproduzido antes do menu administrativo',
  execute: async ctx => {
    ownerOnly(ctx);
    const message = ctx.message?.message || {};
    const quoted = message.extendedTextMessage?.contextInfo?.quotedMessage || {};
    const audio = message.audioMessage || quoted.audioMessage || message.documentMessage || quoted.documentMessage;
    if (!audio) return ctx.replyNYX('Envie um áudio com a legenda 7audio-menu ou responda ao áudio com 7audio-menu.', 'bot');
    if (audio.mimetype && !String(audio.mimetype).startsWith('audio/')) return ctx.replyNYX('❌ O arquivo precisa ser um áudio.', 'bot');
    try {
      const kind = (message.audioMessage || message.documentMessage) ? (message.audioMessage ? 'audio' : 'document') : (quoted.audioMessage ? 'audio' : 'document');
      const buffer = await collect(await downloadContentFromMessage(audio, kind));
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      const temp = `${destination}.${process.pid}.tmp`;
      fs.writeFileSync(temp, buffer, { mode: 0o600 }); fs.renameSync(temp, destination);
      return ctx.replyNYX('✅ Áudio do menu atualizado com sucesso!', 'bot');
    } catch (error) {
      return ctx.replyNYX(error.message === 'AUDIO_TOO_LARGE' ? '❌ O áudio deve ter no máximo 15 MB.' : '❌ Não consegui salvar esse áudio. Tente enviar ou responder ao áudio novamente.', 'bot');
    }
  }
};
