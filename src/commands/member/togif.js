const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");

module.exports = {
    name: ["togif"],
    description: "Converte uma figurinha em GIF; quando contém som, envia vídeo MP4 com áudio",
    execute: async (ctx) => {
        try {
            const kit = await getSoundStickerKit();
            const quoted = kit.quotedOf(ctx.message);
            const sticker = kit.stickerOf(quoted);
            if (!sticker) {
                return replyNYX(ctx, `🖼️ *TOGIF*\n\nUso: Responda a uma figurinha com ${ctx.prefix}togif`, "bot");
            }

            try { await ctx.react("🔄"); } catch (e) {}
            const webp = await kit.downloadMedia(sticker, "sticker");
            const clip = await kit.getStickerSound(sticker);
            const resultado = await kit.stickerToVideo(webp, clip?.ogg || null);
            if (!resultado?.video?.length) throw new Error("O conversor não gerou um vídeo.");

            if (clip) {
                await sendNYXMedia(ctx.sock, ctx.chat, {
                    video: resultado.video,
                    mimetype: "video/mp4",
                    caption: "🔊 GIF não suporta áudio; enviei como vídeo MP4 para preservar o som original."
                }, ctx.message);
            } else {
                await sendNYXMedia(ctx.sock, ctx.chat, {
                    video: resultado.video,
                    mimetype: "video/mp4",
                    gifPlayback: true
                }, ctx.message);
            }
        } catch (error) {
            console.error("[TOGIF] Erro:", error.stderr || error.message);
            await replyNYX(ctx, "❌ Erro ao converter a figurinha em vídeo.", "bot");
        }
    }
};
