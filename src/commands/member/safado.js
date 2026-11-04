const fs = require("fs"); const path = require("path"); const { getTarget } = require("../../utils/checkTarget"); const fonteNYX = require("../../utils/fonteNYX");
module.exports = {
    name: ["safado", "safada"],
    description: "Chama alguém de safado",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        if (!alvo) return ctx.replyNYX("❌ Marque alguém!", "user");
        try { await ctx.react("😈"); } catch (e) {}
        const numSender = sender.split("@")[0], numAlvo = alvo.split("@")[0];
        const frases = ["@sender pegou @alvo sendo safado(a) no privado!", "@alvo não tem jeito, é safado(a) até debaixo d'água! @sender que o diga...", "@sender avisou: cuidado com o @alvo, ele é o rei da safadeza!", "@alvo tá soltando a franga e @sender flagrou!"];
        let legenda = frases[Math.floor(Math.random() * frases.length)].replace("@sender", `@${numSender}`).replace("@alvo", `@${numAlvo}`);
        legenda = fonteNYX(legenda);
        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "safado.mp4"), fallback = path.join(__dirname, "..", "..", "..", "assets", "gifs", "beijo.mp4");
        if (fs.existsSync(gifPath)) await sock.sendMessage(chat, { video: fs.readFileSync(gifPath), gifPlayback: true, caption: legenda, mentions: [sender, alvo] }, { quoted: message });
        else if (fs.existsSync(fallback)) await sock.sendMessage(chat, { video: fs.readFileSync(fallback), gifPlayback: true, caption: legenda, mentions: [sender, alvo] }, { quoted: message });
        else await sock.sendMessage(chat, { text: legenda, mentions: [sender, alvo] }, { quoted: message });
    }
};