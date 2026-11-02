const { requireAdmin } = require("../../utils/checkPermission");
const { setSetting, getSetting } = require("../../utils/groups");

module.exports = {
    name: ["legenda_documento", "legendadoc"],
    description: "Define a legenda padrão para documentos",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const texto = ctx.args.join(" ").trim();

        if (!texto) {
            const atual = getSetting(ctx.chat, "legenda_documento") || "Nenhuma legenda definida.";
            return ctx.replyNYX(`📝 *Legenda de Documento atual:*\n${atual}\n\nUse: \`${ctx.prefix}legenda_documento Sua legenda aqui\``, "user");
        }

        setSetting(ctx.chat, "legenda_documento", texto);
        await ctx.react("✅");
        await ctx.replyNYX(`✅ Legenda de documento atualizada!`, "bot");
    }
};