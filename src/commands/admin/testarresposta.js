const { requireAdmin } = require("../../utils/checkPermission");
const { findAutomaticReplies } = require("../../core/autoReplyManager");

module.exports = {
    name: ["testarresposta", "testarrespostas"],
    description: "Simula uma mensagem contra as respostas automáticas do grupo",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const texto = (ctx.args || []).join(" ").trim();
        if (!texto) {
            return ctx.replyNYX(
                `🧪 *TESTAR RESPOSTA*\n\nUso: *${ctx.prefix}testarresposta <mensagem>*\nExemplo: *${ctx.prefix}testarresposta bom dia*`,
                "bot"
            );
        }
        const encontradas = findAutomaticReplies(ctx.chat, texto);
        if (!encontradas.length) {
            return ctx.replyNYX(`ℹ️ Nenhuma resposta seria acionada para:\n_${texto}_`, "bot");
        }
        const linhas = encontradas.map(item => `• *${item.trigger}* → ${item.response}`);
        return ctx.replyNYX(
            `🧪 *SIMULAÇÃO DE RESPOSTA*\n\nMensagem:\n_${texto}_\n\nRespostas encontradas:\n${linhas.join("\n")}\n\n✅ Nenhuma mensagem automática foi enviada.`,
            "bot"
        );
    }
};
