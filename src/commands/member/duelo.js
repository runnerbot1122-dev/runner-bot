const fs = require("fs");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["duelo", "batalha"],
    description: "Desafie alguém para um duelo",
    execute: async (ctx) => {
        const mentioned = ctx.message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentioned.length === 0) {
            return replyNYX(ctx, `⚔️ *DUELO*\n\nUso: *${ctx.prefix}duelo @alguém*`, "bot");
        }

        const desafiante = ctx.sender;
        const desafiado = mentioned[0];

        if (desafiante === desafiado) {
            return replyNYX(ctx, "❌ Você não pode duelar contra si mesmo!", "bot");
        }

        try { await ctx.react("⚔️"); } catch (e) {}

        const textoDesafio = `⚔️ *DUELO INICIADO!* ⚔️\n\n@${desafiante.split("@")[0]} desafiou @${desafiado.split("@")[0]} para um duelo! Quem será o vencedor?`;
        
        await replyNYX(ctx, { text: textoDesafio, mentions: [desafiante, desafiado] }, "bot");

        setTimeout(async () => {
            const desafianteGanhou = Math.random() < 0.5;
            const vencedor = desafianteGanhou ? desafiante : desafiado;
            const perdedor = desafianteGanhou ? desafiado : desafiante;

            const frases = [
                "num duelo acirrado",
                "com um golpe fatal",
                "numa batalha épica",
                "sem chance para o adversário"
            ];
            const fraseSorteada = frases[Math.floor(Math.random() * frases.length)];

            const textoResultado = `🏆 *FIM DO DUELO!* 🏆\n\n@${vencedor.split("@")[0]} venceu @${perdedor.split("@")[0]} ${fraseSorteada}! 🎊`;

            // Caminho para o vídeo local na pasta assets
            const videoPath = path.join(process.cwd(), "assets", "duelo.mp4");

            try {
                if (fs.existsSync(videoPath)) {
                    const videoBuffer = fs.readFileSync(videoPath);
                    
                    await ctx.sock.sendMessage(ctx.chat, { 
                        video: videoBuffer, 
                        gifPlayback: true, // Faz rodar em loop infinito
                        caption: textoResultado,
                        mentions: [vencedor, perdedor]
                    }, { quoted: ctx.message });
                } else {
                    // Fallback: Se o vídeo não existir, manda só o texto
                    console.log("[DUELO] Arquivo duelo.mp4 não encontrado na pasta assets.");
                    await replyNYX(ctx, { text: textoResultado, mentions: [vencedor, perdedor] }, "bot");
                }
            } catch (error) {
                console.error("[DUELO] Erro ao enviar vídeo:", error.message);
                await replyNYX(ctx, { text: textoResultado, mentions: [vencedor, perdedor] }, "bot");
            }
        }, 3000);
    }
};