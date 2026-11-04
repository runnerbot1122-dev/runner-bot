const fs = require("fs"); const path = require("path"); const { getTarget } = require("../../utils/checkTarget"); const fonteNYX = require("../../utils/fonteNYX");
module.exports = {
    name: ["carioca", "paulista", "mineiro"],
    description: "Zoação regional",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        if (!alvo) return ctx.replyNYX("❌ Marque alguém!", "user");
        try { await ctx.react("🏖️"); } catch (e) {}
        const numSender = sender.split("@")[0], numAlvo = alvo.split("@")[0];
        const frases = ["@sender chamou @alvo de carioca e tomou um susto com o sotaque!", "@alvo é mineiro, uai! @sender não entendeu nada!", "@sender perguntou o caminho e @alvo respondeu em paulistês!", "@alvo tá com o sotaque tão carregado que @sender precisou de tradutor!"];
        let legenda = frases[Math.floor(Math.random() * frases.length)].replace("@sender", `@${numSender}`).replace("@alvo", `@${numAlvo}`);
        legenda = fonteNYX(legenda);
        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "carioca.mp4"), fallback = path.join(__dirname, "..", "..", "..", "assets", "gifs", "beijo.mp4");
        if (fs.existsSync(gifPath)) await sock.sendMessage(chat, { video: fs.readFileSync(gifPath), gifPlayback: true, caption: legenda, mentions: [sender, alvo] }, { quoted: message });
        else if (fs.existsSync(fallback)) await sock.sendMessage(chat, { video: fs.readFileSync(fallback), gifPlayback: true, caption: legenda, mentions: [sender, alvo] }, { quoted: message });
        else await sock.sendMessage(chat, { text: legenda, mentions: [sender, alvo] }, { quoted: message });
    }
};