module.exports = {
    name: "motivacao",
    description: "Envia uma mensagem motivacional",
    execute: async (ctx) => {
        const mensagens = [
            "Você não precisa fazer tudo hoje; precisa apenas continuar.",
            "O resultado começa com a decisão de tentar.",
            "Seu esforço de hoje constrói a conquista de amanhã.",
            "Respire, organize o próximo passo e siga em frente."
        ];
        const mensagem = mensagens[Math.floor(Math.random() * mensagens.length)];
        await ctx.reply(`🌟 *${mensagem}*`);
    }
};
