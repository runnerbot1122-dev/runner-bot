const replyNYX = require("../../utils/replyNYX");
const gameManager = require("../../core/gameManager");

const perguntas = [
    ["Quantos jogadores cada time começa em campo?", "11"],
    ["Qual país venceu a Copa do Mundo de 2002?", "brasil"],
    ["Qual cartão manda o jogador para fora?", "vermelho"],
    ["Como é chamada a cobrança após uma falta dentro da área?", "penalti"],
    ["Quantos minutos dura uma partida sem acréscimos?", "90"],
    ["Qual é o nome dado a três gols do mesmo jogador?", "hat trick"]
];

module.exports = {
    name: ["quizfutebol"],
    description: "Inicia um quiz sobre futebol",

    execute: async ctx => {
        const [pergunta, resposta] = perguntas[Math.floor(Math.random() * perguntas.length)];
        gameManager.iniciarJogo(ctx.chat, ctx.sender, "quiz", { resposta });
        return replyNYX(ctx, `⚽ *QUIZ DE FUTEBOL*\n\n${pergunta}\n\nResponda no chat!`, "bot");
    }
};