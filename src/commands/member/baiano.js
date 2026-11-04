const fs = require("fs");
const path = require("path");
const { getTarget } = require("../../utils/checkTarget");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["baiano", "baiana"],
    description: "Zoeira regional",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        if (!alvo) return ctx.replyNYX("❌ Marque alguém!", "user");

        try { await ctx.react("🌴"); } catch (e) {}

        const numSender = sender.split("@")[0];
        const numAlvo = alvo.split("@")[0];
        
        const frases = [
            `Oxe! @${numSender} descobriu que @${numAlvo} é baiano e já pediu um acarajé! 🌴`,
            `@${numAlvo} tá com o sotaque tão forte que @${numSender} não entendeu nada! 😂`,
            `@${numSender} chamou @${numAlvo} pra um pagode, mas ele já tava no trio elétrico! 🥁`,
            `Ave Maria! @${numAlvo} mostrou o forró pra @${numSender} e quebrou a perna! 💃`
        ];
        let legenda = frases[Math.floor(Math.random() * frases.length)];
legenda = fonteNYX(legenda);

        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "baiano.mp4");
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