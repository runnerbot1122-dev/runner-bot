const ownerOnly = require("../../utils/ownerOnly");
const { isVisualizarAtivo, setVisualizar } = require("../../utils/groups");

module.exports = {
    name: ["visualizarmsg", "antidelete", "antidel"],
    description: "Ativa (1) ou desativa (0) a visualização de mensagens apagadas",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use este comando em um grupo.", "bot");

        const acao = ctx.args[0]?.trim();
        const ativo = isVisualizarAtivo(ctx.chat);

        if (!acao || !["1", "0"].includes(acao)) {
            return ctx.replyNYX(
                `⚙️ Uso:\n\n${ctx.prefix}visualizarmsg 1 (Ativar)\n${ctx.prefix}visualizarmsg 0 (Desativar)`, 
                "bot"
            );
        }

        const querAtivar = acao === "1";

        // Se já está no estado desejado
        if (querAtivar && ativo) {
            return ctx.replyNYX("O anti-delete já está ativo neste grupo, senhor(a).", "bot");
        }
        if (!querAtivar && !ativo) {
            return ctx.replyNYX("O anti-delete já está desativado neste grupo, senhor(a).", "bot");
        }

        // Muda o estado
        setVisualizar(ctx.chat, querAtivar);

        return ctx.replyNYX(
            querAtivar
                ? "👀 *Anti-Delete ATIVADO!*\nAgora você receberá no privado as mensagens apagadas deste grupo."
                : "👋🏽 *Anti-Delete DESATIVADO!*\nAs mensagens apagadas não serão mais monitoradas.",
            "bot"
        );
    }
};
