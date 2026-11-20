const replyNYX = require("../../utils/replyNYX");
const gameManager = require("../../core/gameManager");

const perguntas = [
    ["Qual é o maior animal terrestre?", "elefante"],
    ["Qual animal é conhecido como rei da selva?", "leao"],
    ["Qual animal produz lã?", "ovelha"],
    ["Qual é o animal mais rápido em terra?", "guepardo"],
    ["Qual animal é famoso por mudar de cor?", "camaleao"],
    ["Qual é o maior animal do planeta?", "baleia azul"],
    ["Qual ave não voa e vive na Antártida?", "pinguim"]
];

module.exports = {
    name: ["quizanimais"],
    description: "Inicia um quiz sobre animais",

    execute: async ctx => {
        const [pergunta, resposta] = perguntas[Math.floor(Math.random() * perguntas.length)];
        gameManager.iniciarJogo(ctx.chat, ctx.sender, "quiz", { resposta });
        return replyNYX(ctx, `🐾 *QUIZ DE ANIMAIS*\n\n${pergunta}\n\nResponda no chat!`, "bot");
    }
};