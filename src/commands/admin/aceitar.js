const solicitacoes = require("../../utils/solicitacoesCache");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: "aceitar",
    description: "Aceita TODOS os pedidos de entrada pendentes",
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
        let aceitos = 0;

        for (const alvo of pendentes) {
            try {
                await sock.groupRequestParticipantsUpdate(chat, [alvo], "approve");
                aceitos++;
            } catch (e) {
                console.log(`[ACEITAR] Falha ao aprovar ${alvo}:`, e.message);
            }
        }

        solicitacoes.limpar(chat);
        await ctx.react("✅");
        return replyNYX(ctx, `✅ *SOLICITAÇÕES ACEITAS*\n\n*${aceitos}* membro(s) foram aprovados.`, "user");
    }
};