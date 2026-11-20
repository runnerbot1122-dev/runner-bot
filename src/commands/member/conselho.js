module.exports = {
    name: ["conselho", "conselhos"],
    description: "Envia um conselho aleatório",
    execute: async (ctx) => {
        const conselhos = [
            "Escolha uma prioridade e termine antes de começar outra.",
            "Nem toda resposta precisa ser dada imediatamente.",
            "Cuide do básico: sono, organização e constância.",
            "Peça ajuda quando necessário; isso também é estratégia."
        ];
        const conselho = conselhos[Math.floor(Math.random() * conselhos.length)];
        await ctx.reply(`🧭 *${conselho}*`);
    }
};
