module.exports = {
    name: ["cantada", "cantadas"],
    description: "Envia uma cantada leve",
    execute: async (ctx) => {
        const cantadas = [
            "Você não é notificação, mas fez meu dia ficar melhor.",
            "Se simpatia fosse tempo, você seria um dia inteiro de sol.",
            "Você tem mapa? Me perdi no seu sorriso.",
            "Não sou fotógrafo, mas consigo imaginar nós dois juntos."
        ];
        const cantada = cantadas[Math.floor(Math.random() * cantadas.length)];
        await ctx.reply(`💘 ${cantada}`);
    }
};