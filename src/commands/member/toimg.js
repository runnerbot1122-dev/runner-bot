const sendNYXMedia = require("../../utils/sendNYXMedia");
const replyNYX = require("../../utils/replyNYX");
const sharp = require("sharp");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");

module.exports = {
    name: ["toimg", "toimage"],
    description: "Converte uma figurinha em imagem",
    execute: async (ctx) => {
        try {
            const kit = await getSoundStickerKit();
            const quoted = kit.quotedOf(ctx.message);
            const stickerMessage = kit.stickerOf(quoted) || kit.stickerOf(kit.unwrapMessage(ctx.message?.message));
            if (!stickerMessage) {
                return replyNYX(ctx, "🖼️ Responda a uma figurinha com este comando para convertê-la em imagem.", "bot");
            }

            try { await ctx.react("🖼️"); } catch (e) {}
            const buffer = await kit.downloadMedia(stickerMessage, "sticker");
            if (!buffer?.length) throw new Error("Buffer vazio");
            const imagem = await sharp(buffer).png().toBuffer();
            await sendNYXMedia(ctx.sock, ctx.chat, {
                image: imagem,
                caption: "✅ Figurinha convertida para imagem!"
            }, ctx.message);

            const clip = await kit.getStickerSound(stickerMessage);
            if (clip) {
                await replyNYX(ctx, "ℹ️ A imagem não preserva o áudio da figurinha.", "bot");
            }
        } catch (error) {
            console.error("[TOIMG] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui converter essa figurinha.", "bot");
        }
    }
};
