const ownerOnly = require('../../utils/ownerOnly');
const db = require('../../database/securityGroups');
const { getTarget } = require('../../utils/checkTarget');
module.exports = { name: ['rmdonogp'], description: 'Remove o dono responsável deste grupo', execute: async (ctx) => {
  ownerOnly(ctx);
  if (!ctx.isGroup) return ctx.replyNYX('❌ Use em um grupo.', 'bot');
  const target = getTarget(ctx);
  if (!target) return ctx.replyNYX('Marque ou responda à pessoa que deseja remover.', 'bot');
  const changed = db.removeGroupOwner(ctx.chat, target);
  await ctx.replyNYX(changed ? '✅ Dono do grupo removido do cadastro.' : 'ℹ️ Essa pessoa não estava cadastrada como dono do grupo.', 'bot');
} };
