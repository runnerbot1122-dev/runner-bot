const { setBotName } = require("../../utils/botNameStore");

module.exports = {
    name: ["setbotname", "setnomebot", "nome-bot"],
    description: "Altera o nome personalizado do bot",

    execute: async (ctx) => {
        if (!ctx.isOwner) {
            return ctx.reply("❌ Apenas o dono do bot pode alterar esse nome.");
        }

        const nome = (ctx.args || []).join(" ").trim();

        if (!nome) {
            return ctx.reply(
                `Uso: ${ctx.text[0]}setbotname mayoral771\n\n` +
                "Exemplo: 7setbotname mayoral771"
            );
        }

        try {
            const nomeSalvo = setBotName(nome);

            await ctx.replyNYX(
                `✅ Nome personalizado atualizado!\n\n` +
                `Novo nome: ${nomeSalvo}\n\n` +
                "A alteração foi salva e continuará após reiniciar o bot.",
                "bot"
            );
        } catch (erro) {
            await ctx.reply("❌ " + erro.message);
        }
    }
};
