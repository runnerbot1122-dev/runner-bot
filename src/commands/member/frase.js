module.exports = {
    name: "frase",
    description: "Envia uma frase aleatória",
    execute: async (ctx) => {
        const frases = [
            "Cada passo pequeno também é progresso.",
            "A persistência transforma tentativa em resultado.",
            "Hoje é um bom dia para começar algo novo.",
            "Calma e constância vencem a pressa."
        ];
        const frase = frases[Math.floor(Math.random() * frases.length)];
        await ctx.reply(`💭 *${frase}*`);
    }
};
