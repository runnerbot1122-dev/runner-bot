const fs = require("fs");
const path = require("path");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["beta"],
    description: "Chama alguém de beta",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        if (!alvo) return ctx.replyNYX("❌ Marque alguém!", "user");

        try { await ctx.react("🤓"); } catch (e) {}

        const numSender = sender.split("@")[0];
        const numAlvo = alvo.split("@")[0];
        
        const frases = [
            `@${numSender} confirmou: @${numAlvo} é o rei dos betas! 🤓`,
            `@${numAlvo} tentou ser sigma, mas @${numSender} provou que ele é beta! 📉`,
            `O beta @${numAlvo} foi flagrado por @${numSender} jogando no easy! 👶`,
            `@${numSender} deu um esporro no beta @${numAlvo}! 💀`
        ];
        const legenda = frases[Math.floor(Math.random() * frases.length)];

        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "beta.mp4");
        const fallbackPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "beijo.mp4");

        if (fs.existsSync(gifPath)) {
            await sock.sendMessage(chat, { video: fs.readFileSync(gifPath), gifPlayback: true, caption: legenda, mentions: [sender, alvo] }, { quoted: message });
        } else if (fs.existsSync(fallbackPath)) {
            await sock.sendMessage(chat, { video: fs.readFileSync(fallbackPath), gifPlayback: true, caption: legenda, mentions: [sender, alvo] }, { quoted: message });
        } else {
            await sock.sendMessage(chat, { text: legenda, mentions: [sender, alvo] }, { quoted: message });
        }
    }
};