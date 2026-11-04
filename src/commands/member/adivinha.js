const replyNYX = require("../../utils/replyNYX");
const gameManager = require("../../core/gameManager");

module.exports = {
    name: ["adivinha", "adivinhar"],
    description: "Adivinhe o número que o bot pensou",
    execute: async (ctx) => {
        const numero = Math.floor(Math.random() * 10) + 1; // 1 a 10
        
        let dica = "";
        if (numero % 2 === 0) dica += "É um número *PAR*. ";
        else dica += "É um número *ÍMPAR*. ";
        
        if (numero > 5) dica += "É maior que 5. ";
        else dica += "É menor ou igual a 5. ";
        
        if (numero % 3 === 0) dica += "É múltiplo de 3.";
        
        gameManager.iniciarJogo(ctx.chat, ctx.sender, "adivinha", { resposta: String(numero) });

        await replyNYX(ctx, `🎲 Pensei em um número de 1 a 10.\n\nDICAS: ${dica}\n\nTente adivinhar enviando o número!`, "bot");
    }
};