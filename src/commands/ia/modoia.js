const replyNYX = require("../../utils/replyNYX");
const { getMode, setMode, clearMode } = require("../../utils/aiConversation");

module.exports = {
    name: "modoia",
    description: "Ativa ou desativa a conversa contínua com a IA",
    execute: async (ctx) => {
        const action = String(ctx.args[0] || "on").toLowerCase();
        if (["off", "desligar", "desativar", "0"].includes(action)) {
            clearMode(ctx.chat, ctx.sender);
            return replyNYX(ctx, "✅ Modo IA contínuo desativado. As mensagens normais não serão enviadas para a IA.", "bot");
        }
        if (["status", "info"].includes(action)) {
            const active = getMode(ctx.chat, ctx.sender);
            return replyNYX(ctx, active
                ? `🟢 Modo IA contínuo ativo com o provedor *${active.provider}*.\nUse ${ctx.prefix}modoia off para desativar.`
                : `⚪ Modo IA contínuo está desativado.\nUse ${ctx.prefix}modoia on para ativar.`, "bot");
        }
        const provider = ["gemini", "groq", "claude"].includes(action) ? action : "gemini";
        setMode(ctx.chat, ctx.sender, provider);
        return replyNYX(ctx, `✅ Modo IA contínuo ativado com *${provider}*.\nAgora envie mensagens normais sem prefixo.\nUse ${ctx.prefix}modoia off para desativar.`, "bot");
    }
};
