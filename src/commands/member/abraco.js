const fs = require("fs");
const path = require("path");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["abraco", "abraçar", "abracar"],
    description: "Envia um abraço virtual com GIF",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);

        if (!alvo) {
            return ctx.replyNYX("❌ Marque ou responda alguém para mandar um abraço!", "user");
        }

        try { await ctx.react("🫂"); } catch (e) {}

        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "abraco.mp4");

        if (!fs.existsSync(gifPath)) {
            return ctx.replyNYX(`⚠️ O arquivo do GIF não foi encontrado.\n\nCrie o arquivo em: *assets/gifs/abraco.mp4*`, "user");
        }

        const gifBuffer = fs.readFileSync(gifPath);
        const numeroSender = sender.split("@")[0];
        const numeroAlvo = alvo.split("@")[0];

        const frases = [
            `@${numeroSender} deu um abraço bem apertado em @${numeroAlvo}! 🫂`,
            `Nada melhor que um abraço! @${numeroSender} abraçou @${numeroAlvo} 🤗`,
            `@${numeroSender} correu e deu um abraço em @${numeroAlvo} para acalmar o coração 💙`,
            `Aquece o coração! @${numeroSender} abraçou @${numeroAlvo} 🥰`
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
            console.error("[ABRACO] Erro:", e.message);
            await ctx.replyNYX("❌ Deu erro ao tentar enviar o abraço.", "bot");
        }
    }
};