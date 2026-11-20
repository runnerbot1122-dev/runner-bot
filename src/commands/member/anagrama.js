const replyNYX = require("../../utils/replyNYX");
const gameManager = require("../../core/gameManager");

const palavras = ["abacaxi", "computador", "futebol", "chocolate", "girafa", "amizade", "brasil", "sorvete"];

function embaralhar(texto) {
    const chars = texto.split("");
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    const resultado = chars.join("");
    return resultado === texto ? embaralhar(texto) : resultado;
}

module.exports = {
    name: ["anagrama"],
    description: "Jogo de descobrir a palavra embaralhada",

    execute: async ctx => {
        const resposta = palavras[Math.floor(Math.random() * palavras.length)];
        gameManager.iniciarJogo(ctx.chat, ctx.sender, "quiz", { resposta });
        return replyNYX(ctx, `🔤 *ANAGRAMA*\n\nDescubra a palavra:\n*${embaralhar(resposta)}*\n\nResponda no chat!`, "bot");
    }
};