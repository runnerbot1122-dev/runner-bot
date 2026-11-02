module.exports = {
    name: "abraco",
    description: "Envia um abraço virtual",
    execute: async (ctx) => {
        await ctx.reply("🤗 Receba um abraço virtual bem apertado!");
    }
};
