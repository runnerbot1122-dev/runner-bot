const fs = require("fs"); const path = require("path"); const { getTarget } = require("../../utils/checkTarget"); const fonteNYX = require("../../utils/fonteNYX");
module.exports = {
    name: ["chance", "sorte"],
    description: "Calcula a chance de algo dar certo",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        const numAlvo = alvo ? alvo.split("@")[0] : sender.split("@")[0];
        try { await ctx.react("🎲"); } catch (e) {}
        const chance = Math.floor(Math.random() * 101);
        let frase = chance >= 80 ? "É praticamente certeza!" : chance >= 50 ? "A chance é boa!" : chance >= 20 ? "Difícil, mas não impossível." : "Pode desistir, a chance é nula.";
        let legenda = `🎲 *CHANCE*\n\n@${numAlvo} tem *${chance}%* de chance de dar certo.\n\n_${frase}_`;
        legenda = fonteNYX(legenda);
        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "chance.mp4"), fallback = path.join(__dirname, "..", "..", "..", "assets", "gifs", "beijo.mp4");
        if (fs.existsSync(gifPath)) await sock.sendMessage(chat, { video: fs.readFileSync(gifPath), gifPlayback: true, caption: legenda, mentions: [sender, alvo || sender] }, { quoted: message });
        else if (fs.existsSync(fallback)) await sock.sendMessage(chat, { video: fs.readFileSync(fallback), gifPlayback: true, caption: legenda, mentions: [sender, alvo || sender] }, { quoted: message });
        else await sock.sendMessage(chat, { text: legenda, mentions: [sender, alvo || sender] }, { quoted: message });
    }
};