const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const replyNYX = require("../../utils/replyNYX");
const { Image } = require("node-webpmux");

module.exports = {
    name: ["stickerinfo", "figinfo"],
    description: "Mostra o nome e autor de uma figurinha",
    execute: async (ctx) => {
        let stickerMessage = ctx.message.message?.stickerMessage;
        if (!stickerMessage) {
            const quoted = ctx.message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            stickerMessage = quoted?.stickerMessage;
        }

        if (!stickerMessage) {
            return replyNYX(ctx, "🏷️ Responda a uma figurinha com este comando.", "bot");
        }

        try { await ctx.react("🏷️"); } catch (e) {}

        try {
            const mensagemParaBaixar = { key: ctx.message.key, message: { stickerMessage } };
            const buffer = await downloadMediaMessage(mensagemParaBaixar, "buffer", {}, { logger: console });
            
            const img = new Image();
            await img.load(buffer);
            
            let packname = "Desconhecido";
            let author = "Desconhecido";

            if (img.exif) {
                try {
                    const exifStr = img.exif.toString("utf8");
                    // Procura o JSON do EXIF de forma mais segura
                    const match = exifStr.match(/\{.*"sticker-pack-name".*\}/);
                    
                    if (match) {
                        const exifJson = JSON.parse(match[0]);
                        packname = exifJson["sticker-pack-name"] || packname;
                        author = exifJson["sticker-pack-publisher"] || author;
                    }
                } catch (e) {
                    console.error("[STICKERINFO] Erro ao ler EXIF:", e.message);
                }
            }

            const texto = 
`╔═━✰『 ɪɴғᴏ ғɪɢᴜʀɪɴʜᴀ 』═━✰

║╎⊹ ࣪ ˖ 📦 ▸ ᴘᴀᴄᴏᴛᴇ: *${packname}*
║╎⊹ ࣪ ˖ ✍️ ▸ ᴀᴜᴛᴏʀ: *${author}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");

        } catch (error) {
            console.error("[STICKERINFO] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui ler as informações dessa figurinha.", "bot");
        }
    }
};