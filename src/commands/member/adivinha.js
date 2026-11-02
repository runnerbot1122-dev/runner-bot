module.exports = {
    name: "adivinha",
    description: "Propõe um número para adivinhar",
    execute: async (ctx) => {
        const numero = Math.floor(Math.random() * 10) + 1;
        await ctx.reply(`🔮 Pensei em um número de 1 a 10.\n\nDica: ele é *${numero % 2 === 0 ? "par" : "ímpar"}*. Tente adivinhar!`);
    }
};
