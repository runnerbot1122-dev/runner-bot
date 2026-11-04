const replyNYX = require("../../utils/replyNYX");
const { requireAdmin } = require("../../utils/checkPermission");
const database = require("../../database/database");

module.exports = {
    name: ["zerarativos", "zerarxp", "resetxp"],
    description: "Zera o XP de todos os membros deste grupo",
    category: "admin",
    adminOnly: true,
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return replyNYX(ctx, "❌ Apenas grupos.", "user");

        let zerados = 0;
        for (const [id, user] of Object.entries(database.users)) {
            if (user.xpByGroup && user.xpByGroup[ctx.chat]) {
                delete user.xpByGroup[ctx.chat]; // Apaga o XP só desse grupo
                zerados++;
            }
        }

        database.saveUsers();

        await replyNYX(ctx, `╔═━✰『 ᴢᴇʀᴀʀ ᴀᴛɪᴠɪᴅᴀᴅᴇ 』═━✰\n\n║╎⊹ ࣪ ˖ 🗑️ ▸ O ranking de XP foi zerado!\n║╎⊹ ࣪ ˖ 👥 ▸ *${zerados}* membros tiveram os dados limpos.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
    }
};