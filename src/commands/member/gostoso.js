const fs = require("fs");
const path = require("path");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["gostoso", "gostosa"],
    description: "Faz um elogio ousado",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        if (!alvo) return ctx.replyNYX("❌ Marque alguém!", "user");

        try { await ctx.react("🔥"); } catch (e) {}

        const numSender = sender.split("@")[0];
        const numAlvo = alvo.split("@")[0];
        
        const frases = [
            `Eita! @${numSender} tá de olho em @${numAlvo}, hein? 🔥`,
            `@${numAlvo} tá deixando @${numSender} com a pressão alta! 🥵`,
            `Calma @${numSender}, o @${numAlvo} é gostoso(a) mas não é de ferro! 💦`,
            `@${numSender} acabou de passar mal de tanto olhar pra @${numAlvo}! 😵‍💫`
        ];
        const legenda = frases[Math.floor(Math.random() * frases.length)];

        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "gostoso.mp4");
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