const ownerOnly = require('../../utils/ownerOnly');
const security = require('../../database/securityGroups');

module.exports = {
  name: ['anti-arqv', 'antiarqv'],
  description: 'Ativa/desativa a proteção contra promoção de administradores sem autorização',
  execute: async (ctx) => {
    ownerOnly(ctx);
    if (!ctx.isGroup) return ctx.replyNYX('❌ Use este comando em um grupo.', 'bot');
    const enabled = !security.isAntiArqvEnabled(ctx.chat);
    security.setAntiArqv(ctx.chat, enabled);
    return ctx.replyNYX(enabled
      ? '🛡️ Recurso anti-arquivamento ativado! 🙇🏽‍♂️'
      : '🛡️ Recurso anti-arquivamento desativado.', 'bot');
  }
};
