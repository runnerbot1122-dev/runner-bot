const replyNYX = require("../../utils/replyNYX");
const {
    findSticker,
    downloadSticker,
    readStickerInfo,
    formatBytes
} = require("../../utils/stickerTools");

module.exports = {
    name: ["idfig"],
    description: "Identifica uma figurinha pelo hash",

    execute: async ctx => {
        const sticker = await findSticker(ctx.message);
        if (!sticker) {
            return replyNYX(ctx, "🆔 Responda a uma figurinha com este comando.", "bot");
        }

        try {
            await ctx.react("🆔");
            const buffer = await downloadSticker(ctx, sticker);
            const info = await readStickerInfo(buffer);

            const texto =
`╔═━✰『 ɪᴅᴇɴᴛɪғɪᴄᴀʀ ғɪɢᴜʀɪɴʜᴀ 』═━✰

🆔 ID: *${info.id}*
🔐 SHA-256: *${info.hash}*
📦 Tamanho: *${formatBytes(info.size)}*
📐 Dimensões: *${info.width}x${info.height}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            return replyNYX(ctx, texto, "bot");
        } catch (error) {
            console.error("[IDFIG] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui identificar essa figurinha.", "bot");
        }
    }
};
