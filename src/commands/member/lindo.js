const fs = require("fs");
const path = require("path");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["lindo", "linda"],
    description: "Elogia a beleza de alguém",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        if (!alvo) return ctx.replyNYX("❌ Marque alguém para elogiar!", "user");

        try { await ctx.react("😍"); } catch (e) {}

        const numSender = sender.split("@")[0];
        const numAlvo = alvo.split("@")[0];
        
        const frases = [
            `@${numSender} acha que @${numAlvo} é a pessoa mais linda do mundo! 😍`,
            `Cuidado! A beleza de @${numAlvo} acabou de cegar @${numSender}! ✨`,
            `@${numSender} olhou pra @${numAlvo} e se apaixonou na hora. 😳`,
            `@${numAlvo} é tão lindo(a) que @${numSender} até esqueceu de respirar! 🥰`
        ];
        const legenda = frases[Math.floor(Math.random() * frases.length)];

        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "lindo.mp4");
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