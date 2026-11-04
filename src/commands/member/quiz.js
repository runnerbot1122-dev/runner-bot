const replyNYX = require("../../utils/replyNYX");
const gameManager = require("../../core/gameManager");

const perguntas = [
    { p: "Quantos lados tem um triângulo?", r: "3" },
    { p: "Qual a capital do Brasil?", r: "brasilia" },
    { p: "Quanto é 5 + 5?", r: "10" },
    { p: "Qual a cor do céu limpo?", r: "azul" },
    { p: "Quantos dias tem um ano bissexto?", r: "366" },
    { p: "Qual é o maior planeta do sistema solar?", r: "jupiter" },
    { p: "Quem pintou a Mona Lisa?", r: "leonardo da vinci" },
    { p: "Qual é o animal mais rápido do mundo?", r: "guepardo" },
    { p: "Quantos continentes existem?", r: "6" },
    { p: "Qual é o metal mais precioso do mundo?", r: "ouro" },
    { p: "Quanto é 10 x 10?", r: "100" },
    { p: "Qual é o oceano mais profundo?", r: "pacifico" },
    { p: "Em que ano o homem pisou na Lua?", r: "1969" },
    { p: "Qual é o idioma falado no Brasil?", r: "portugues" },
    { p: "Quantas cores tem o arco-íris?", r: "7" },
    { p: "Qual é o maior animal terrestre?", r: "elefante" },
    { p: "Quem descobriu o Brasil?", r: "pedro alvares cabral" },
    { p: "Quanto é 3 x 4?", r: "12" },
    { p: "Qual é a montanha mais alta do mundo?", r: "everest" },
    { p: "Qual é o rio mais longo do mundo?", r: "nilo" }
];

module.exports = {
    name: ["quiz"],
    description: "Inicia um quiz de perguntas",
    execute: async (ctx) => {
        const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)];
        
        gameManager.iniciarJogo(ctx.chat, ctx.sender, "quiz", { resposta: pergunta.r });

        await replyNYX(ctx, `🧠 *QUIZ*\n\n${pergunta.p}\n\n_Envie a resposta no chat!_`, "bot");
    }
};