const perguntas = [
    {
        pergunta: "Qual é o maior planeta do Sistema Solar?",
        resposta: "júpiter"
    },
    {
        pergunta: "Quantos lados tem um triângulo?",
        resposta: "3"
    },
    {
        pergunta: "Qual é a capital do Brasil?",
        resposta: "brasília"
    }
];
module.exports = {
    name: "quiz",
    description: "Faz uma pergunta rápida",
    execute: async (ctx) => {
        const item = perguntas[Math.floor(Math.random() * perguntas.length)];
        await ctx.reply(`🧠 *Quiz:* ${item.pergunta}\n\nResponda com: ${item.resposta}`);
    }
};
