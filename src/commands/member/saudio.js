const replyNYX = require("../../utils/replyNYX");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");
const { getBotName } = require("../../utils/botNameStore");

module.exports = {
    name: ["saudio"],
    description: "Cria figurinha com som a partir de áudio ou vídeo",
    execute: async (ctx) => {
        try {
            const kit = await getSoundStickerKit();
            const resultado = await kit.figurinha(ctx.sock, ctx.message, {
                args: ctx.args.join(" "),
                packname: getBotName(),
                author: ctx.message?.pushName || "",
                maxSeconds: 30
            });
            if (!resultado.ok) return replyNYX(ctx, `❌ ${resultado.erro || "Não consegui criar a figurinha com som."}`, "bot");
            return resultado;
        } catch (erro) {
            console.error("[SAUDIO] Erro:", erro.message);
            return replyNYX(ctx, "❌ Não consegui iniciar o sistema de figurinha com som.", "bot");
        }
    }
};
