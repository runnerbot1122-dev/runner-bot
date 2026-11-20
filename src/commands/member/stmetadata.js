const replyNYX = require("../../utils/replyNYX");
const {
    findSticker,
    downloadSticker,
    readStickerInfo,
    formatBytes
} = require("../../utils/stickerTools");

module.exports = {
    name: ["stmetadata"],
    description: "Mostra os metadados de uma figurinha",

    execute: async ctx => {
        const sticker = findSticker(ctx.message);
        if (!sticker) {
            return replyNYX(ctx, "🏷️ Responda a uma figurinha com este comando.", "bot");
        }

        try {
            await ctx.react("🏷️");
            const buffer = await downloadSticker(ctx, sticker);
            const info = await readStickerInfo(buffer);

            const texto =
`╔═━✰『 ᴍᴇᴛᴀᴅᴀᴅᴏs ᴅᴀ ғɪɢᴜʀɪɴʜᴀ 』═━✰

📦 Pacote: *${info.packname}*
✍️ Autor: *${info.author}*
🆔 Pacote ID: *${info.packid}*
📐 Dimensões: *${info.width}x${info.height}*
💾 Tamanho: *${formatBytes(info.size)}*
🧾 EXIF: *${formatBytes(info.exifSize)}*
🔐 ID: *${info.id}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            return replyNYX(ctx, texto, "bot");
        } catch (error) {
            console.error("[STMETADATA] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui ler os metadados dessa figurinha.", "bot");
        }
    }
};