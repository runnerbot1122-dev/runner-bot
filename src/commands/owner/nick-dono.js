const ownerOnly = require('../../utils/ownerOnly');
const update = require('../../utils/updateOwnerConfig');
module.exports = { name: ['nick-dono', 'nickdono'], description: 'Atualiza o apelido do dono no config.js', execute: async ctx => { ownerOnly(ctx); const value = (ctx.args || []).join(' ').trim(); if (!value) return ctx.replyNYX('Uso: 7nick-dono Novo apelido', 'bot'); try { update.setNick(value); return ctx.replyNYX('✅ Apelido do dono atualizado no config.js.', 'bot'); } catch (e) { return ctx.replyNYX('❌ Use um apelido de até 40 caracteres, sem quebras de linha.', 'bot'); } } };
