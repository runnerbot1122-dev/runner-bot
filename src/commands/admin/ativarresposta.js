const { requireAdmin } = require("../../utils/checkPermission");
const { setAutoReplyEnabled } = require("../../utils/groups");

module.exports = {
    name: ["ativarresposta", "ativarrespostas", "ligarresposta"],
    description: "Ativa uma resposta automática do grupo",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const trigger = (ctx.args || []).join(" ").trim();
        if (!trigger) {
            return ctx.replyNYX(
                `⚙️ Uso: *${ctx.prefix}ativarresposta <gatilho>*\nExemplo: *${ctx.prefix}ativarresposta bom dia*`,
                "bot"
            );
        }
        const resposta = setAutoReplyEnabled(ctx.chat, trigger, true);
        if (!resposta) return ctx.replyNYX(`❌ Resposta automática não encontrada:\n${trigger}`, "bot");
        return ctx.replyNYX(`✅ Resposta automática ativada:\n*${resposta.trigger}* → ${resposta.response}`, "bot");
    }
};
