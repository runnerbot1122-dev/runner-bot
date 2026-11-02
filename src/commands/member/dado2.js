module.exports = {
    name: "dado2",
    description: "Lança dois dados de seis faces",
    execute: async (ctx) => {
        const primeiro = Math.floor(Math.random() * 6) + 1;
        const segundo = Math.floor(Math.random() * 6) + 1;
        await ctx.reply(`🎲 Dados: *${primeiro}* e *${segundo}*\n➕ Total: *${primeiro + segundo}*.`);
    }
};
