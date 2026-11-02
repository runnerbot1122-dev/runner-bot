const { requireAdmin } = require("../../utils/checkPermission");
const { setSetting, getSetting } = require("../../utils/groups");

module.exports = {
    name: ["legenda_imagem", "legendaimg"],
    description: "Define a legenda padrão para imagens",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const texto = ctx.args.join(" ").trim();

        if (!texto) {
            const atual = getSetting(ctx.chat, "legenda_imagem") || "Nenhuma legenda definida.";
            return ctx.replyNYX(`📝 *Legenda de Imagem atual:*\n${atual}\n\nUse: \`${ctx.prefix}legenda_imagem Sua legenda aqui\``, "user");
        }

        setSetting(ctx.chat, "legenda_imagem", texto);
        await ctx.react("✅");
        await ctx.replyNYX(`✅ Legenda de imagem atualizada!`, "bot");
    }
};