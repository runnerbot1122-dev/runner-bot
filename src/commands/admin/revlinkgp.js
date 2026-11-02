const { requireAdmin } = require("../../utils/checkPermission");

module.exports = {
    name: ["revlinkgp", "revlinkgroup"],
    description: "Revoga o link do grupo",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");
        try {
            await ctx.sock.groupRevokeInvite(ctx.chat);
            const newCode = await ctx.sock.groupInviteCode(ctx.chat);
            await ctx.replyNYX(`✅ Link revogado!\n\nNovo link: https://chat.whatsapp.com/${newCode}`, "bot");
        } catch (e) {
            await ctx.reply("❌ Não consegui revogar o link.");
        }
    }
};