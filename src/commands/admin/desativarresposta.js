const { requireAdmin } = require("../../utils/checkPermission");
const { setAutoReplyEnabled } = require("../../utils/groups");

module.exports = {
    name: ["desativarresposta", "desativarrespostas", "desligarresposta"],
    description: "Desativa uma resposta automática sem removê-la",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const trigger = (ctx.args || []).join(" ").trim();
        if (!trigger) {
            return ctx.replyNYX(
                `⚙️ Uso: *${ctx.prefix}desativarresposta <gatilho>*\nExemplo: *${ctx.prefix}desativarresposta bom dia*`,
                "bot"
            );
        }
        const resposta = setAutoReplyEnabled(ctx.chat, trigger, false);
        if (!resposta) return ctx.replyNYX(`❌ Resposta automática não encontrada:\n${trigger}`, "bot");
        return ctx.replyNYX(`⏸️ Resposta automática desativada, mas mantida no grupo:\n*${resposta.trigger}*`, "bot");
    }
};
