const replyNYX = require("../../utils/replyNYX");
const { iniciarJogo } = require("../../core/gameManager");

const enigmas = [
    { pergunta: "O que é, o que é: quanto mais se tira, maior fica?", resposta: "buraco" },
    { pergunta: "O que é, o que é: tem dentes, mas não morde?", resposta: "pente" },
    { pergunta: "O que é, o que é: sobe e desce, mas nunca sai do lugar?", resposta: "escada" },
    { pergunta: "O que é, o que é: cai em pé e corre deitado?", resposta: "chuva" },
    { pergunta: "O que é, o que é: quando está limpo, fica sujo?", resposta: "agua" },
    { pergunta: "O que é, o que é: tem olhos mas não vê?", resposta: "agulha" },
    { pergunta: "O que é, o que é: nasce grande e morre pequeno?", resposta: "lapis" },
    { pergunta: "O que é, o que é: é seu, mas os outros usam mais que você?", resposta: "nome" },
    { pergunta: "O que é, o que é: anda com os pés na cabeça?", resposta: "piolho" },
    { pergunta: "O que é, o que é: quanto mais escuro, mais claro fica?", resposta: "noite" }
];

module.exports = {
    name: ["enigma", "charada"],
    description: "Jogo de adivinhação",
    execute: async (ctx) => {
        const enigmaSorteado = enigmas[Math.floor(Math.random() * enigmas.length)];

        // Inicia o jogo como "adivinha" para o handler capturar automaticamente
        iniciarJogo(ctx.chat, ctx.sender, "adivinha", { 
            resposta: enigmaSorteado.resposta 
        });

        const texto = `🧩 *ENIGMA*\n\n"${enigmaSorteado.pergunta}"\n\n💡 Digite a resposta (ou use ${ctx.prefix}desistir para desistir).`;
        
        await replyNYX(ctx, texto, "bot");
    }
};