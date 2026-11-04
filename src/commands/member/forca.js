const replyNYX = require("../../utils/replyNYX");
const gameManager = require("../../core/gameManager");

const palavras = [
    "GIRAFA", "ELEFANTE", "BICICLETA", "COMPUTADOR", "ABACAXI", "BANANA", "CACHORRO", "GATO", 
    "MACA", "LARANJA", "UVA", "MORANGO", "MELANCIA", "ABACATE", "PIPOCA", "CHOCOLATE", "SORVETE",
    "PIZZA", "HAMBURGER", "BATATA", "ARROZ", "FEIJAO", "MACARRAO", "LASANHA", "REFRIGERANTE",
    "ESCOLA", "PROFESSOR", "MEDICO", "ENGENHEIRO", "ADVOGADO", "POLICIAL", "BOMBEIRO",
    "CARRO", "MOTO", "AVIAO", "NAVIO", "TREM", "ONIBUS", "BICICLETA", "PATINETE",
    "BRASIL", "ARGENTINA", "PORTUGAL", "JAPAO", "CANADA", "FRANCA", "ITALIA", "ALEMANHA",
    "FUTEBOL", "BASQUETE", "VOLEI", "NATACAO", "CORRIDA", "XADREZ", "VIDEOGAME"
];

module.exports = {
    name: ["forca"],
    description: "Jogo da forca",
    execute: async (ctx) => {
        const palavra = palavras[Math.floor(Math.random() * palavras.length)];
        
        gameManager.iniciarJogo(ctx.chat, ctx.sender, "forca", { 
            palavra: palavra,
            letrasChutadas: [],
            vidas: 6
        });

        const tabuleiro = palavra.split("").map(() => "_").join(" ");

        await replyNYX(ctx, `🪢 *FORCA*\n\nPALAVRA: ${tabuleiro}\nDICA: ${palavra.length} letras.\n\n❤️ Vidas: 6\n\nEnvie uma letra para tentar!`, "bot");
    }
};