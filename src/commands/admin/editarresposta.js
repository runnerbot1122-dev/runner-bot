const { requireAdmin } = require("../../utils/checkPermission");
const { updateAutoReply } = require("../../utils/groups");

module.exports = {
    name: ["editarresposta", "editarrespostas", "editresposta"],
    description: "Edita uma resposta automática do grupo",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const raw = (ctx.args || []).join(" ").trim();
        const separador = raw.indexOf("|");
        if (separador < 0) {
            return ctx.replyNYX(
                `⚙️ Uso: *${ctx.prefix}editarresposta <gatilho atual> | <novo gatilho> | <nova resposta>*\nExemplo: *${ctx.prefix}editarresposta bom dia | boa tarde | Boa tarde, família!*`,
                "bot"
            );
        }
        const partes = raw.split("|").map(item => item.trim());
        if (partes.length !== 3 || partes.some(item => !item)) {
            return ctx.replyNYX(
                `⚙️ Informe três partes separadas por |:\n*${ctx.prefix}editarresposta gatilho atual | novo gatilho | nova resposta*`,
                "bot"
            );
        }
        const resposta = updateAutoReply(ctx.chat, partes[0], partes[1], partes[2]);
        if (!resposta) {
            return ctx.replyNYX(
                "❌ Não foi possível editar. Verifique se o gatilho existe e se o novo gatilho ainda não está cadastrado.",
                "bot"
            );
        }
        return ctx.replyNYX(`✅ Resposta automática atualizada:\n*${resposta.trigger}* → ${resposta.response}`, "bot");
    }
};
