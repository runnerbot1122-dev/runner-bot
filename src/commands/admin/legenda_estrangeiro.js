const { requireAdmin } = require("../../utils/checkPermission");
const { setSetting, getSetting } = require("../../utils/groups");

module.exports = {
    name: ["legenda_estrangeiro", "legendaestrangeiro"],
    description: "Define a legenda para números estrangeiros",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const texto = ctx.args.join(" ").trim();

        if (!texto) {
            const atual = getSetting(ctx.chat, "legenda_estrangeiro") || "Nenhuma legenda definida.";
            return ctx.replyNYX(`📝 *Legenda de Estrangeiro atual:*\n${atual}\n\nUse: \`${ctx.prefix}legenda_estrangeiro Sua legenda aqui\``, "user");
        }

        setSetting(ctx.chat, "legenda_estrangeiro", texto);
        await ctx.react("✅");
        await ctx.replyNYX(`✅ Legenda de estrangeiro atualizada!`, "bot");
    }
};