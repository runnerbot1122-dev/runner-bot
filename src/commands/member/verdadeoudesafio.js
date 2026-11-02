module.exports = {
    name: "verdadeoudesafio",
    description: "Escolhe entre verdade e desafio",
    execute: async (ctx) => {
        const verdades = [
            "Qual foi a última coisa que te fez sorrir?",
            "Qual habilidade você gostaria de aprender?",
            "Qual foi uma decisão da qual você se orgulha?"
        ];
        const desafios = [
            "Envie uma mensagem positiva para alguém.",
            "Faça uma pausa e respire fundo três vezes.",
            "Conte uma curiosidade sobre você."
        ];
        const verdade = Math.random() < 0.5;
        const lista = verdade ? verdades : desafios;
        const item = lista[Math.floor(Math.random() * lista.length)];
        await ctx.reply(`${verdade ? "🗣️ VERDADE" : "🎯 DESAFIO"}\n\n${item}`);
    }
};
