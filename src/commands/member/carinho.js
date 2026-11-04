const fs = require("fs");
const path = require("path");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["carinho", "cafune", "afago"],
    description: "Envia um carinho virtual com GIF",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);

        if (!alvo) {
            return ctx.replyNYX("❌ Marque ou responda alguém para mandar um carinho!", "user");
        }

        try { await ctx.react("🥰"); } catch (e) {}

        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "carinho.mp4");

        if (!fs.existsSync(gifPath)) {
            return ctx.replyNYX(`⚠️ O arquivo do GIF não foi encontrado.\n\nCrie o arquivo em: *assets/gifs/carinho.mp4*`, "user");
        }

        const gifBuffer = fs.readFileSync(gifPath);
        const numeroSender = sender.split("@")[0];
        const numeroAlvo = alvo.split("@")[0];

        const frases = [
            `@${numeroSender} fez um carinho na cabeça de @${numeroAlvo}! 🥰`,
            `Que fofura! @${numeroSender} deu muito carinho em @${numeroAlvo} 🫶`,
            `@${numeroSender} não resistiu e fez carinho em @${numeroAlvo} para alegrar o dia ✨`,
            `Mimos! @${numeroSender} encheu @${numeroAlvo} de carinho 💖`
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
            console.error("[CARINHO] Erro:", e.message);
            await ctx.replyNYX("❌ Deu erro ao tentar enviar o carinho.", "bot");
        }
    }
};