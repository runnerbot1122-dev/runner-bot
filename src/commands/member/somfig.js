const replyNYX = require("../../utils/replyNYX");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");

module.exports = {
    name: ["somfig"],
    description: "Extrai o áudio de uma figurinha com som e envia como nota de voz",
    execute: async (ctx) => {
        try {
            const kit = await getSoundStickerKit();
            const sticker = kit.stickerOf(kit.quotedOf(ctx.message));
            if (!sticker) return replyNYX(ctx, "🎧 Responda a uma figurinha com som usando .somfig.", "bot");

            const clip = await kit.getStickerSound(sticker);
            if (!clip?.ogg?.length) return replyNYX(ctx, "❌ Essa figurinha não contém um áudio disponível.", "bot");

            await ctx.sock.sendMessage(ctx.chat, {
                audio: clip.ogg,
                mimetype: "audio/ogg; codecs=opus",
                ptt: true
            }, { quoted: ctx.message });
        } catch (erro) {
            console.error("[SOMFIG] Erro:", erro.message);
            return replyNYX(ctx, "❌ Não consegui extrair o som dessa figurinha.", "bot");
        }
    }
};
