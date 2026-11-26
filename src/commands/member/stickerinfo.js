const replyNYX = require("../../utils/replyNYX");
const { findSticker, downloadSticker, readStickerInfo } = require("../../utils/stickerTools");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");

module.exports = {
    name: ["stickerinfo", "figinfo"],
    description: "Mostra o nome e autor de uma figurinha",
    execute: async (ctx) => {
        try {
            const sticker = await findSticker(ctx.message);
            if (!sticker) return replyNYX(ctx, "🏷️ Responda a uma figurinha com este comando.", "bot");
            try { await ctx.react("🏷️"); } catch (e) {}

            const buffer = await downloadSticker(ctx, sticker);
            const info = await readStickerInfo(buffer);
            const kit = await getSoundStickerKit();
            const clip = await kit.getStickerSound(sticker);
            const texto =
`╔═━✰『 ɪɴғᴏ ᴅᴀ ғɪɢᴜʀɪɴʜᴀ 』═━✰

║╎⊹ ࣪ ˖ 📦 ▸ ᴘᴀᴄᴏᴛᴇ: *${info.packname}*
║╎⊹ ࣪ ˖ ✍️ ▸ ᴀᴜᴛᴏʀ: *${info.author}*
║╎⊹ ࣪ ˖ 🔊 ▸ sᴏᴍ: *${clip ? `${clip.seconds}s` : "Não"}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;
            return replyNYX(ctx, texto, "bot");
        } catch (error) {
            console.error("[STICKERINFO] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui ler as informações dessa figurinha.", "bot");
        }
    }
};
