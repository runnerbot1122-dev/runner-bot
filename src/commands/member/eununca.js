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
    "Eu nunca inventei uma desculpa para não sair.",
    "Eu nunca stalkeei alguém nas redes sociais.",
    "Eu nunca disse que estava chegando quando ainda nem tinha saído.",
    "Eu nunca assisti a uma série inteira em um único dia.",
    "Eu nunca enviei um áudio para a conversa errada.",
    "Eu nunca apaguei uma mensagem para tentar esconder o que escrevi.",
    "Eu nunca fiquei acordado até tarde mexendo no celular.",
    "Eu nunca fingi entender uma conversa.",
    "Eu nunca usei o celular escondido durante uma aula ou reunião.",
    "Eu nunca esqueci onde deixei meu próprio celular.",
    "Eu nunca tirei print de uma conversa.",
    "Eu nunca mudei de caminho para evitar encontrar alguém.",
    "Eu nunca comi a comida de outra pessoa sem pedir.",
    "Eu nunca prometi guardar um segredo e contei para alguém.",
    "Eu nunca voltei a conversar com alguém que disse que não procuraria mais.",
    "Eu nunca coloquei o despertador para depois e voltei a dormir.",
    "Eu nunca pesquisei meus sintomas na internet e achei que era algo grave."
];

function sortear(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

module.exports = {
    name: ["eununca"],
    description: "Sorteia uma frase de Eu Nunca em formato de enquete",

    execute: async (ctx) => {
        const frase = sortear(frases);
        const enquete = {
            poll: {
                name: fonteNYX(`🙈 EU NUNCA\n\n${frase}`),
                values: [fonteNYX("Já fiz"), fonteNYX("Nunca fiz")],
                selectableCount: 1
            }
        };

        try { await ctx.react("🙈"); } catch (e) {}

        try {
            return await ctx.sock.sendMessage(
                ctx.chat,
                enquete,
                { quoted: ctx.message }
            );
        } catch (error) {
            console.error("[EUNUNCA] Falha na enquete:", error.message);
            return replyNYX(
                ctx,
                `🙈 *EU NUNCA*\n\n${frase}\n\nQuem já fez?\n✅ Eu já\n❌ Eu nunca`,
                "bot"
            );
        }
    }
};
