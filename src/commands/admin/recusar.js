const solicitacoes = require("../../utils/solicitacoesCache");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: "recusar",
    description: "Recusa TODOS os pedidos de entrada pendentes",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { sock, chat, isAdmin } = ctx;

        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores.", "user");

        const pendentes = solicitacoes.obterTodos(chat);

        if (pendentes.length === 0) {
            return replyNYX(ctx, "❌ Nenhuma solicitação pendente no momento.", "user");
        }

        await ctx.react("⏳");
        let recusados = 0;

        for (const alvo of pendentes) {
            try {
                await sock.groupRequestParticipantsUpdate(chat, [alvo], "reject");
                recusados++;
            } catch (e) {
                console.log(`[RECUSAR] Falha ao recusar ${alvo}:`, e.message);
            }
        }

        solicitacoes.limpar(chat);
        await ctx.react("✅");
        return replyNYX(ctx, `✅ *SOLICITAÇÕES RECUSADAS*\n\n*${recusados}* membro(s) foram recusados.`, "user");
    }
};