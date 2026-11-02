module.exports = {
    name: "beijo",
    description: "Envia um beijo virtual",
    execute: async (ctx) => {
        await ctx.reply("😘 Um beijo virtual para alegrar seu dia!");
    }
};
