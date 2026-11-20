const replyNYX = require("../../utils/replyNYX");
const gameManager = require("../../core/gameManager");

module.exports = {
    name: ["revelarenigma"],
    description: "Revela a resposta do enigma ativo",

    execute: async ctx => {
        const jogo = gameManager.getJogo(ctx.chat, ctx.sender);
        if (!jogo || jogo.tipo !== "adivinha") {
            return replyNYX(ctx, "🧩 Você não tem um enigma ativo agora.", "bot");
        }

        gameManager.encerrarJogo(ctx.chat, ctx.sender);
        return replyNYX(ctx, `💡 A resposta do enigma era: *${jogo.dados.resposta}*`, "bot");
    }
};