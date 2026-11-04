const fs = require("fs");
const path = require("path");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["beijo", "beijar"],
    description: "Envia um beijo virtual com GIF",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;

        const alvo = getTarget(ctx);

        if (!alvo) {
            return ctx.replyNYX("❌ Marque ou responda alguém para mandar um beijo!", "user");
        }

        // Reage com o emoji de beijo
        try { await ctx.react("💋"); } catch (e) {}

        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "beijo.mp4");

        if (!fs.existsSync(gifPath)) {
            return ctx.replyNYX(`⚠️ O arquivo do GIF não foi encontrado.\n\nCrie o arquivo em: *assets/gifs/beijo.mp4*`, "user");
        }

        const gifBuffer = fs.readFileSync(gifPath);

        const numeroSender = sender.split("@")[0];
        const numeroAlvo = alvo.split("@")[0];

        const frases = [
            `@${numeroSender} acabou de dar um beijo em @${numeroAlvo}! 😘`,
            `O amor está no ar! @${numeroSender} beijou @${numeroAlvo} 💋`,
            `@${numeroSender} não resistiu e deu um beijo em @${numeroAlvo} 🥰`,
            `Cuidado! @${numeroSender} roubou um beijo de @${numeroAlvo} 😏`
        ];
        const legenda = frases[Math.floor(Math.random() * frases.length)];

        try {
            await sock.sendMessage(chat, {
                video: gifBuffer,
                gifPlayback: true,
                caption: legenda,
                mentions: [sender, alvo]
            }, { quoted: message });

        } catch (e) {
            console.error("[BEIJO] Erro:", e.message);
            await ctx.replyNYX("❌ Deu erro ao tentar enviar o beijo.", "bot");
        }
    }
};