const { requireAdmin } = require("../../utils/checkPermission");
const { getAutoReplies } = require("../../utils/groups");

module.exports = {
    name: ["listarrespostas", "listarespostas"],
    description: "Lista as respostas automáticas do grupo atual",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const respostas = getAutoReplies(ctx.chat).filter(item => item?.enabled !== false);
        if (respostas.length === 0) {
            return ctx.replyNYX("ℹ️ Nenhuma resposta automática cadastrada neste grupo.", "bot");
        }
        const texto = respostas
            .map((item, indice) => `${indice + 1}. *${item.trigger}* → ${item.response}`)
            .join("\n");
        return ctx.replyNYX(
            `📋 *RESPOSTAS AUTOMÁTICAS DO GRUPO*\n\n${texto}\n\nRemova com *${ctx.prefix}delr <gatilho>*.`,
            "bot"
        );
    }
};
