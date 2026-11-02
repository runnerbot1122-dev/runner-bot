module.exports = {
    name: "carinho",
    description: "Envia uma mensagem de carinho",
    execute: async (ctx) => {
        await ctx.reply("💛 Que não faltem carinho, paz e bons motivos para sorrir!");
    }
};
