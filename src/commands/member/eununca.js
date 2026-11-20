const replyNYX = require("../../utils/replyNYX");
const fonteNYX = require("../../utils/fonteNYX");

const frases = [
    "Eu nunca fingi que não vi uma mensagem.",
    "Eu nunca dormi enquanto deveria estar estudando.",
    "Eu nunca mandei mensagem para a pessoa errada.",
    "Eu nunca ri em uma situação séria.",
    "Eu nunca comi escondido durante a madrugada.",
    "Eu nunca esqueci o aniversário de alguém importante.",
    "Eu nunca cantei no chuveiro.",
    "Eu nunca inventei uma desculpa para não sair."
];

module.exports = {
    name: ["eununca"],
    description: "Sorteia uma frase de Eu Nunca em formato de enquete",

    execute: async ctx => {
        const frase = frases[Math.floor(Math.random() * frases.length)];

        try {
            await ctx.react("🙈");
            return await ctx.reply({
                poll: {
                    name: fonteNYX(`🙈 EU NUNCA\n\n${frase}`),
                    values: [fonteNYX("Já fiz"), fonteNYX("Nunca fiz")],
                    selectableCount: 1
                }
            });
        } catch (error) {
            console.error("[EUNUNCA] Falha na enquete:", error.message);
            return replyNYX(
                ctx,
                `🙈 *EU NUNCA*\n\n${frase}\n\nQuem já fez?\n✅ Já fiz\n❌ Nunca fiz`,
                "bot"
            );
        }
    }
};
