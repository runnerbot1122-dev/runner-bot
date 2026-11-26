const replyNYX = require("../../utils/replyNYX");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");
const { getBotName } = require("../../utils/botNameStore");

module.exports = {
    name: ["circulo", "redonda"],
    description: "Cria ou refaz uma figurinha redonda, mantendo o som quando disponível",
    execute: async (ctx) => {
        try {
            const kit = await getSoundStickerKit();
            const resultado = await kit.figurinha(ctx.sock, ctx.message, {
                args: ctx.args.join(" "),
                packname: getBotName(),
                author: ctx.message?.pushName || "",
                circle: true,
                maxSeconds: 30
            });
            if (!resultado.ok) return replyNYX(ctx, `❌ ${resultado.erro || "Não consegui criar a figurinha redonda."}`, "bot");
            return resultado;
        } catch (erro) {
            console.error("[CIRCULO] Erro:", erro.message);
            return replyNYX(ctx, "❌ Não consegui iniciar a conversão para figurinha redonda.", "bot");
        }
    }
};
