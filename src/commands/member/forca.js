const palavras = ["abacaxi", "janela", "girassol", "telefone"];
module.exports = {
    name: "forca",
    description: "Inicia uma rodada simples de forca",
    execute: async (ctx) => {
        const palavra = palavras[Math.floor(Math.random() * palavras.length)];
        const mascara = palavra.replace(/[aeiou]/gi, "_");
        await ctx.reply(`🪢 *Forca*\n\nPalavra: *${mascara}*\nDica: tem ${palavra.length} letras.\n\nEnvie uma letra para tentar!`);
    }
};
