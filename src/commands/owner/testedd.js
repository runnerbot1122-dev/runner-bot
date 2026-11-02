// src/commands/owner/testedd.js
const { isDDDBloqueado } = require("../../utils/ddd");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: "testedd",
    description: "Simula a proteção Anti-DDD para testes",
    category: "owner",
    ownerOnly: true,
    async execute(ctx) {
        const { chat, args, isOwner } = ctx;

        if (!isOwner) return replyNYX(ctx, "❌ Apenas o dono.", "user");

        const ddd = args[0] || "11"; // Pega o DDD do argumento ou usa 11
        const numeroFake = `55${ddd}999999999@s.whatsapp.net`;

        // Verifica se o número fake está bloqueado usando a função do seu sistema
        const bloqueado = isDDDBloqueado(chat, numeroFake);

        if (bloqueado) {
            await replyNYX(ctx, `✅ *TESTE BEM-SUCEDIDO*\n\nO DDD *${ddd}* está bloqueado neste grupo.\nUm número fake com esse DDD (55${ddd}...) seria punido.`, "user");
        } else {
            await replyNYX(ctx, `❌ *TESTE FALHOU*\n\nO DDD *${ddd}* NÃO está na lista de bloqueio.\nUse *add_ddd ${ddd}* para bloquear e teste de novo.`, "user");
        }
    }
};