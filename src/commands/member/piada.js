module.exports = {
    name: "piada",
    description: "Envia uma piada curta",
    execute: async (ctx) => {
        const piadas = [
            "Por que o computador foi ao médico? Porque estava com vírus.",
            "O que o zero disse para o oito? Belo cinto!",
            "Por que o livro de matemática ficou triste? Porque tinha muitos problemas.",
            "Qual é o animal mais antigo? A zebra, porque é em preto e branco."
        ];
        const piada = piadas[Math.floor(Math.random() * piadas.length)];
        await ctx.reply(`😄 ${piada}`);
    }
};
