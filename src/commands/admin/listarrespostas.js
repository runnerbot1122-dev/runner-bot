const { requireAdmin } = require("../../utils/checkPermission");
const { getAutoReplies } = require("../../utils/groups");

module.exports = {
    name: ["listarrespostas", "listarespostas"],
    description: "Lista as respostas automáticas do grupo atual",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const respostas = getAutoReplies(ctx.chat);
        if (respostas.length === 0) {
            return ctx.replyNYX("ℹ️ Nenhuma resposta automática cadastrada neste grupo.", "bot");
        }
        const texto = respostas
            .map((item, indice) => `${indice + 1}. ${item?.enabled === false ? "⏸️" : "✅"} *${item.trigger}* → ${item.response}`)
            .join("\n");
        return ctx.replyNYX(
            `📋 *RESPOSTAS AUTOMÁTICAS DO GRUPO*\n\n${texto}\n\nGerencie com:\n• *${ctx.prefix}editarresposta gatilho atual | novo gatilho | nova resposta*\n• *${ctx.prefix}ativarresposta <gatilho>*\n• *${ctx.prefix}desativarresposta <gatilho>*\n• *${ctx.prefix}delr <gatilho>* para remover.`,
            "bot"
        );
    }
};
