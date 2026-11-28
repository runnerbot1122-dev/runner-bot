const replyNYX = require("../../utils/replyNYX");
const { clearHistory, getMode } = require("../../utils/aiConversation");

module.exports = {
    name: "limparia",
    description: "Apaga o histórico da conversa com a IA",
    execute: async (ctx) => {
        const ativo = getMode(ctx.chat, ctx.sender);
        const removidos = clearHistory(ctx.chat, ctx.sender);
        const provedor = ativo?.provider ? ` O modo contínuo continua ativo com *${ativo.provider}*.` : "";
        return replyNYX(ctx, `✅ Histórico da IA apagado (${removidos} provedor(es)).${provedor}`, "bot");
    }
};
