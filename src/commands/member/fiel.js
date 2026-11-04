const fs = require("fs"); const path = require("path"); const { getTarget } = require("../../utils/checkTarget"); const fonteNYX = require("../../utils/fonteNYX");
module.exports = {
    name: ["fiel", "infiel"],
    description: "Testa a fidelidade de alguém",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        if (!alvo) return ctx.replyNYX("❌ Marque alguém!", "user");
        try { await ctx.react("🕵️"); } catch (e) {}
        const numSender = sender.split("@")[0], numAlvo = alvo.split("@")[0];
        const frases = ["@sender descobriu que @alvo é 100% fiel!", "@alvo foi flagrado(a) traindo @sender no zap!", "@sender confia em @alvo, mas o coração tá apertado...", "@alvo nem sabe o que é traição!"];
        let legenda = frases[Math.floor(Math.random() * frases.length)].replace("@sender", `@${numSender}`).replace("@alvo", `@${numAlvo}`);
        legenda = fonteNYX(legenda);
        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "fiel.mp4"), fallback = path.join(__dirname, "..", "..", "..", "assets", "gifs", "beijo.mp4");
        if (fs.existsSync(gifPath)) await sock.sendMessage(chat, { video: fs.readFileSync(gifPath), gifPlayback: true, caption: legenda, mentions: [sender, alvo] }, { quoted: message });
        else if (fs.existsSync(fallback)) await sock.sendMessage(chat, { video: fs.readFileSync(fallback), gifPlayback: true, caption: legenda, mentions: [sender, alvo] }, { quoted: message });
        else await sock.sendMessage(chat, { text: legenda, mentions: [sender, alvo] }, { quoted: message });
    }
};