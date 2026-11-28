const replyNYX = require("../../utils/replyNYX");
const { getMode, getHistoryInfo, TTL } = require("../../utils/aiConversation");

module.exports = {
    name: "statusia",
    description: "Mostra o status do modo contínuo e do histórico da IA",
    execute: async (ctx) => {
        const ativo = getMode(ctx.chat, ctx.sender);
        const historico = getHistoryInfo(ctx.chat, ctx.sender);
        if (!ativo) {
            return replyNYX(ctx, `⚪ *Modo IA:* desativado\n🧾 *Histórico:* ${historico.messages} mensagem(ns)\n\nUse ${ctx.prefix}modoia para ativar.`, "bot");
        }
        const restantes = Math.max(0, Math.ceil((ativo.expiresAt - Date.now()) / 60000));
        return replyNYX(ctx, `🟢 *Modo IA:* ativo\n🤖 *Provedor:* ${ativo.provider}\n🧾 *Histórico:* ${historico.messages} mensagem(ns)\n⏳ *Expira em:* aproximadamente ${restantes} minuto(s)\n♻️ *TTL configurado:* ${TTL / 60000} minutos`, "bot");
    }
};
