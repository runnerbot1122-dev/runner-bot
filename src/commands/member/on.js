const afk = require('../../database/afk');
const users = require('../../utils/users');
const { obterIdentidadeMensagem } = require('../../utils/messageIdentity');

module.exports = {
  name: ['on'],
  description: 'Encerra a ausência',
  execute: async (ctx) => {
    try {
      const identidade = obterIdentidadeMensagem(ctx.message);
      const candidatos = [...new Set([ctx.sender, identidade.jid, identidade.lid].filter(Boolean))];
      let old = null;
      let chaveEncontrada = null;

      for (const candidato of candidatos) {
        old = afk.get(candidato);
        if (old) { chaveEncontrada = candidato; break; }
      }

      // Tente as identidades associadas pelo registro local, sem inferir telefone a partir de LID.
      if (!old) {
        const perfil = identidade.lid ? users.getUserByLid(identidade.lid)
          : identidade.jid ? users.getUserByJid(identidade.jid) : null;
        for (const candidato of [perfil?.jid, perfil?.lid].filter(Boolean)) {
          old = afk.get(candidato);
          if (old) { chaveEncontrada = candidato; break; }
        }
      }

      if (!old) return ctx.replyNYX('Você não estava marcado como ausente.', 'user');
      if (chaveEncontrada) afk.remove(chaveEncontrada);

      const perfil = identidade.lid ? users.getUserByLid(identidade.lid)
        : identidade.jid ? users.getUserByJid(identidade.jid) : null;
      // Menção clicável: o token @id deve acompanhar mentions; só o nome de perfil
      // no texto não cria uma menção do WhatsApp.
      const alvoMencao = identidade.jid || ctx.sender || identidade.lid;
      const tokenMencao = alvoMencao
        ? `@${String(alvoMencao).split('@')[0].split(':')[0]}`
        : String(ctx.message?.pushName || perfil?.name || 'Você').trim();
      return ctx.replyNYX({
        text: `👋 Bem-vindo de volta ${tokenMencao}! Ausente por ${afk.formatDuration(Date.now() - old.since)}.`,
        ...(alvoMencao ? { mentions: [alvoMencao] } : {})
      }, 'user');
    } catch (e) {
      return ctx.replyNYX('❌ Não consegui atualizar seu status de ausência.', 'user');
    }
  }
};
