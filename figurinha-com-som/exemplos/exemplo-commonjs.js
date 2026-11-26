/**
 * EXEMPLO — bot em CommonJS (usa require / module.exports)
 * O kit é ESM, então ele é carregado com import() uma vez só.
 */
let kit = null;
async function carregarKit() {
  if (kit) return kit;
  kit = await import('../lib/index.mjs');            // ajuste o caminho até a pasta do kit
  kit.useBaileys(require('@whiskeysockets/baileys'));  // use o MESMO pacote do seu bot (ex.: 'baileys')
  return kit;
}

// Dentro do seu handler de comandos (o "switch(command)" do seu bot):
async function comandoFigurinha(sock, msg, command, q) {
  const k = await carregarKit();
  const jid = msg.key.remoteJid;
  switch (command) {
    case 's':
    case 'sticker':
    case 'sc': {
      const r = await k.figurinha(sock, msg, {
        args: q,                         // texto depois do comando (ex.: "15", "1:05 10", "mudo", "circulo")
        packname: 'Meu Bot',
        author: msg.pushName || '',
        circle: command === 'sc'
      });
      if (!r.ok) await sock.sendMessage(jid, { text: '❌ ' + r.erro }, { quoted: msg });
      return true;
    }
    case 'take': {
      const st = k.stickerOf(k.quotedOf(msg));
      if (!st) { await sock.sendMessage(jid, { text: 'Responda uma figurinha.' }, { quoted: msg }); return true; }
      const [pack, autor] = String(q || '').split('|').map((s) => s && s.trim());
      await k.trocarPacote(sock, jid, st, { quoted: msg, packname: pack || 'Meu Bot', author: autor || '' });
      return true;
    }
  }
  return false;
}

module.exports = { carregarKit, comandoFigurinha };
