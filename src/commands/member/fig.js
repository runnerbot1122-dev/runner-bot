const replyNYX = require("../../utils/replyNYX");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");
const { getBotName } = require("../../utils/botNameStore");

async function executarFigurinha(ctx, { circle = false } = {}) {
    try {
        const kit = await getSoundStickerKit();
        const resultado = await kit.figurinha(ctx.sock, ctx.message, {
            args: ctx.args.join(" "),
            packname: getBotName(),
            author: ctx.message?.pushName || "",
            circle,
            maxSeconds: 30
        });

        if (!resultado.ok) {
            const erro = resultado.erro || "Não consegui fazer a figurinha. Tente de novo.";
            if (/Marque uma imagem, um vídeo, um áudio ou uma figurinha/i.test(erro)) {
                return replyNYX(ctx,
                    `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🖼️ ▸ Responda a uma imagem, vídeo, áudio ou figurinha com *${ctx.prefix}fig*.\n║╎⊹ ࣪ ˖ ⏱️ ▸ Vídeos: até 30 segundos.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`,
                    "bot");
            }
            return replyNYX(ctx, `❌ ${erro}`, "bot");
        }

        return resultado;
    } catch (erro) {
        console.error("[FIG-SOM] Falha no comando:", erro.message);
        return replyNYX(ctx, "❌ O sistema de figurinha não conseguiu iniciar. Verifique as dependências e tente novamente.", "bot");
    }
}

module.exports = {
    name: ["fig", "sticker", "st", "fsticker", "figvideo", "stk"],
    description: "Cria figurinha de imagem, vídeo ou áudio; mantém o som quando disponível",
    execute: async (ctx) => executarFigurinha(ctx)
};

module.exports.executarFigurinha = executarFigurinha;
