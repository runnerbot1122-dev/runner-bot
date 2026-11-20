const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["roletarussa"],
    description: "Brincadeira aleatória de roleta russa virtual",

    execute: async ctx => {
        const perdeu = Math.floor(Math.random() * 6) === 0;
        return replyNYX(ctx, perdeu
            ? "🔫 *CLIQUE!*\n\nVocê perdeu a rodada virtual. Nada aconteceu de verdade."
            : "🔫 *CLIQUE!*\n\nVocê sobreviveu à rodada virtual!", "bot");
    }
};