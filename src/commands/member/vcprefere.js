const replyNYX = require("../../utils/replyNYX");
const fonteNYX = require("../../utils/fonteNYX");

const perguntas = [
    { pergunta: "Você prefere viajar para o passado ou para o futuro?", opcoes: ["Passado", "Futuro"] },
    { pergunta: "Você prefere nunca mais usar redes sociais ou nunca mais assistir filmes?", opcoes: ["Sem redes sociais", "Sem filmes"] },
    { pergunta: "Você prefere ter muito dinheiro ou muito tempo livre?", opcoes: ["Muito dinheiro", "Muito tempo livre"] },
    { pergunta: "Você prefere morar na praia ou na montanha?", opcoes: ["Praia", "Montanha"] },
    { pergunta: "Você prefere ler pensamentos ou ficar invisível?", opcoes: ["Ler pensamentos", "Ficar invisível"] },
    { pergunta: "Você prefere ter memória perfeita ou aprender qualquer habilidade rapidamente?", opcoes: ["Memória perfeita", "Aprender habilidades"] }
];

module.exports = {
    name: ["vcprefere"],
    description: "Faz uma enquete de Você Prefere",

    execute: async ctx => {
        const item = perguntas[Math.floor(Math.random() * perguntas.length)];

        try {
            await ctx.react("🤔");
            return await ctx.reply({
                poll: {
                    name: fonteNYX(`🤔 VOCÊ PREFERE?\n\n${item.pergunta}`),
                    values: item.opcoes.map(opcao => fonteNYX(opcao)),
                    selectableCount: 1
                }
            });
        } catch (error) {
            console.error("[VCPREFERE] Falha na enquete:", error.message);
            return replyNYX(
                ctx,
                `🤔 *VOCÊ PREFERE?*\n\n${item.pergunta}\n\nA: ${item.opcoes[0]}\nB: ${item.opcoes[1]}`,
                "bot"
            );
        }
    }
};
