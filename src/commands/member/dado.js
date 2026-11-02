module.exports = {
    name: "dado",
    description: "Lança um dado de seis faces",
    execute: async (ctx) => {
        const resultado = Math.floor(Math.random() * 6) + 1;
        await ctx.reply(`🎲 O dado caiu em *${resultado}*.`);
    }
};
