const fs = require("fs");
const path = require("path");
const { getTarget } = require("../../utils/checkTarget");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["sigma"],
    description: "Chama alguém de sigma",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        if (!alvo) return ctx.replyNYX("❌ Marque alguém!", "user");

        try { await ctx.react("🗿"); } catch (e) {}

        const numSender = sender.split("@")[0];
        const numAlvo = alvo.split("@")[0];
        
        const frases = [
            `@${numSender} reconheceu a aura de @${numAlvo}. Um verdadeiro SIGMA! 🗿`,
            `@${numAlvo} não chora, não reclama, apenas domina. @${numSender} atestou! 🍷`,
            `O nível de @${numAlvo} é tão alto que @${numSender} precisou de binóculos! 📈`,
            `@${numSender} tentou competir com @${numAlvo}, mas descobriu que ele é um sigma! 🐺`
        ];
        let legenda = frases[Math.floor(Math.random() * frases.length)];
legenda = fonteNYX(legenda);

        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "sigma.mp4");
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