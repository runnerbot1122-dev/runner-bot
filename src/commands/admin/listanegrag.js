const { requireAdmin } = require("../../utils/checkPermission");
const replyNYX = require("../../utils/replyNYX");
const db = require("../../database/securityGroups"); // Ajuste o caminho se necessário

module.exports = {
    name: ["listanegrag", "listanegra", "verblacklistgp"],
    description: "Lista os números na lista negra deste grupo",
    category: "admin",
    adminOnly: true,
    execute: async (ctx) => {
        requireAdmin(ctx);
        
        if (!ctx.isGroup) {
            return replyNYX(ctx, "❌ Use em um grupo.", "user");
        }

        const users = db.getBlacklist(ctx.chat);

        if (!users || users.length === 0) {
            return replyNYX(ctx, "╔═━✰『 ʟɪsᴛᴀ ɴᴇɢʀᴀ 』═━✰\n\n║╎⊹ ࣪ ˖ ℹ️ ▸ A lista negra deste grupo está vazia.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰", "bot");
        }

        let texto = `╔═━✰『 ʟɪsᴛᴀ ɴᴇɢʀᴀ 』═━✰\n\n`;
        texto += `║╎⊹ ࣪ ˖ 🚫 ▸ ᴛᴏᴛᴀʟ: *${users.length}*\n\n`;

        users.forEach((u, i) => {
            texto += `║╎⊹ ࣪ ˖ ${i + 1}º ▸ @${u.split('@')[0]}\n`;
        });

        texto += `\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: users }, "bot");
    }
};