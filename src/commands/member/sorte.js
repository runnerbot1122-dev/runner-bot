module.exports = {
    name: "sorte",
    description: "Escolhe uma opção aleatória",
    execute: async (ctx) => {
        const opcoes = ctx.args.length
            ? ctx.args
            : ["sim", "não", "talvez"];
        const escolha = opcoes[Math.floor(Math.random() * opcoes.length)];
        await ctx.reply(`🍀 Minha escolha: *${escolha}*.`);
    }
};
