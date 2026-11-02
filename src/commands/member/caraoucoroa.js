module.exports = {
    name: "caraoucoroa",
    description: "Joga cara ou coroa",
    execute: async (ctx) => {
        const resultado = Math.random() < 0.5 ? "cara" : "coroa";
        await ctx.reply(`🪙 Deu *${resultado}*!`);
    }
};
