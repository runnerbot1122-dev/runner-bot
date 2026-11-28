const replyNYX = require("../../utils/replyNYX");
const fonteNYX = require("../../utils/fonteNYX");

const perguntas = [
    { pergunta: "Você prefere viajar para o passado ou para o futuro?", opcoes: ["Passado", "Futuro"] },
    { pergunta: "Você prefere nunca mais usar redes sociais ou nunca mais assistir filmes?", opcoes: ["Sem redes sociais", "Sem filmes"] },
    { pergunta: "Você prefere ter muito dinheiro ou muito tempo livre?", opcoes: ["Muito dinheiro", "Muito tempo livre"] },
    { pergunta: "Você prefere morar na praia ou na montanha?", opcoes: ["Praia", "Montanha"] },
    { pergunta: "Você prefere ler pensamentos ou ficar invisível?", opcoes: ["Ler pensamentos", "Ficar invisível"] },
    { pergunta: "Você prefere ter memória perfeita ou aprender qualquer habilidade rapidamente?", opcoes: ["Memória perfeita", "Aprender habilidades"] },
    { pergunta: "Você prefere falar todas as línguas ou tocar todos os instrumentos?", opcoes: ["Falar todas as línguas", "Tocar todos os instrumentos"] },
    { pergunta: "Você prefere nunca mais sentir frio ou nunca mais sentir calor?", opcoes: ["Nunca sentir frio", "Nunca sentir calor"] },
    { pergunta: "Você prefere morar sozinho ou dividir a casa com seus melhores amigos?", opcoes: ["Morar sozinho", "Morar com amigos"] },
    { pergunta: "Você prefere ter uma viagem grátis por ano ou comida grátis para sempre?", opcoes: ["Uma viagem por ano", "Comida grátis"] },
    { pergunta: "Você prefere ser muito famoso ou muito rico sem ser conhecido?", opcoes: ["Muito famoso", "Rico e anônimo"] },
    { pergunta: "Você prefere sempre chegar uma hora cedo ou sempre chegar dez minutos atrasado?", opcoes: ["Uma hora cedo", "Dez minutos atrasado"] },
    { pergunta: "Você prefere ter wi-fi perfeito ou bateria infinita no celular?", opcoes: ["Wi-fi perfeito", "Bateria infinita"] },
    { pergunta: "Você prefere poder pausar o tempo ou voltar cinco minutos no passado?", opcoes: ["Pausar o tempo", "Voltar cinco minutos"] },
    { pergunta: "Você prefere trabalhar no emprego dos sonhos ou nunca mais precisar trabalhar?", opcoes: ["Emprego dos sonhos", "Nunca mais trabalhar"] },
    { pergunta: "Você prefere ganhar um carro novo ou uma casa nova?", opcoes: ["Carro novo", "Casa nova"] },
    { pergunta: "Você prefere lembrar de todos os seus sonhos ou nunca mais ter pesadelos?", opcoes: ["Lembrar dos sonhos", "Sem pesadelos"] },
    { pergunta: "Você prefere ter sorte em tudo ou ser muito inteligente?", opcoes: ["Ter muita sorte", "Ser muito inteligente"] }
];

function sortear(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

module.exports = {
    name: ["vcprefere"],
    description: "Faz uma enquete de Você Prefere",

    execute: async (ctx) => {
        const item = sortear(perguntas);
        const enquete = {
            poll: {
                name: fonteNYX(`🤔 VOCÊ PREFERE?\n\n${item.pergunta}`),
                values: item.opcoes.map((opcao) => fonteNYX(opcao)),
                selectableCount: 1
            }
        };

        try { await ctx.react("🤔"); } catch (e) {}

        try {
            return await ctx.sock.sendMessage(
                ctx.chat,
                enquete,
                { quoted: ctx.message }
            );
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
