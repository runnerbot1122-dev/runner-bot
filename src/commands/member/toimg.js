const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const replyNYX = require("../../utils/replyNYX");
const sharp = require("sharp");

module.exports = {
    name: ["toimg", "toimage"],
    description: "Converte uma figurinha em imagem",
    execute: async (ctx) => {
        let stickerMessage = ctx.message.message?.stickerMessage;
        
        // Se não for figurinha direta, tenta pegar da citação
        if (!stickerMessage) {
            const quoted = ctx.message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            stickerMessage = quoted?.stickerMessage;
        }

        if (!stickerMessage) {
            return replyNYX(ctx, "🖼️ Responda a uma figurinha com este comando para convertê-la em imagem.", "bot");
        }

        try { await ctx.react("🖼️"); } catch (e) {}

        try {
            const mensagemParaBaixar = {
                key: ctx.message.key,
                message: { stickerMessage }
            };
            
            const buffer = await downloadMediaMessage(mensagemParaBaixar, "buffer", {}, { logger: console });
            
            if (!buffer) throw new Error("Buffer vazio");

            // O sharp converte o webp da figurinha para PNG
            const imagem = await sharp(buffer).png().toBuffer();

            await sendNYXMedia(ctx.sock, ctx.chat, {
                image: imagem,
                caption: "✅ Figurinha convertida para imagem!"
            }, ctx.message);

        } catch (error) {
            console.error("[TOIMG] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui converter essa figurinha.", "bot");
        }
    }
};