const replyNYX = require("../../utils/replyNYX");
const gameManager = require("../../core/gameManager");

module.exports = {
    name: ["resetvelha", "resetarvelha"],
    description: "Encerra a partida ativa de jogo da velha",

    execute: async ctx => {
        const partida = gameManager.getJogoAtivoNoGrupo(ctx.chat, "jogodavelha");
        if (!partida) {
            return replyNYX(ctx, "ℹ️ Não há uma partida de jogo da velha ativa neste grupo.", "bot");
        }

        gameManager.encerrarJogo(ctx.chat, partida.dados.jogador1);
        return replyNYX(ctx, "✅ A partida de jogo da velha foi encerrada.", "bot");
    }
};
