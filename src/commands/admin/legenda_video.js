const { requireAdmin } = require("../../utils/checkPermission");
const { setSetting, getSetting } = require("../../utils/groups");

module.exports = {
    name: ["legenda_video", "legendavid"],
    description: "Define a legenda padrão para vídeos",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const texto = ctx.args.join(" ").trim();

        if (!texto) {
            const atual = getSetting(ctx.chat, "legenda_video") || "Nenhuma legenda definida.";
            return ctx.replyNYX(`📝 *Legenda de Vídeo atual:*\n${atual}\n\nUse: \`${ctx.prefix}legenda_video Sua legenda aqui\``, "user");
        }

        setSetting(ctx.chat, "legenda_video", texto);
        await ctx.react("✅");
        await ctx.replyNYX(`✅ Legenda de vídeo atualizada!`, "bot");
    }
};