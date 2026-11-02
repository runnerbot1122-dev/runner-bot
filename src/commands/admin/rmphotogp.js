const { requireAdmin } = require("../../utils/checkPermission");

module.exports = {
    name: ["rmphotogp","removerfotogp"],
    description: "Remove a foto do grupo",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");
        try {
            await ctx.sock.removeProfilePicture(ctx.chat);
            await ctx.replyNYX("✅ Foto do grupo removida!", "bot");
        } catch (e) {
            await ctx.reply("❌ Não consegui remover a foto.");
        }
    }
};