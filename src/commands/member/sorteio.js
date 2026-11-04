const fs = require("fs"); const path = require("path"); const fonteNYX = require("../../utils/fonteNYX");
module.exports = {
    name: ["sorteio"],
    description: "Sorteia um membro do grupo",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        if (!ctx.isGroup) return ctx.replyNYX("❌ Apenas grupos.", "user");
        try {
            const metadata = await sock.groupMetadata(chat);
            const membros = metadata.participants.map(p => p.id);
            const sorteado = membros[Math.floor(Math.random() * membros.length)];
            try { await ctx.react("🏆"); } catch (e) {}
            let legenda = `🏆 *SORTEIO*\n\nO grande vencedor é... @${sorteado.split("@")[0]}! Parabéns!\n\n_Sorteado por @${sender.split("@")[0]}_`;
            legenda = fonteNYX(legenda);
            const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "sorteio.mp4"), fallback = path.join(__dirname, "..", "..", "..", "assets", "gifs", "beijo.mp4");
            if (fs.existsSync(gifPath)) await sock.sendMessage(chat, { video: fs.readFileSync(gifPath), gifPlayback: true, caption: legenda, mentions: [sorteado, sender] }, { quoted: message });
            else if (fs.existsSync(fallback)) await sock.sendMessage(chat, { video: fs.readFileSync(fallback), gifPlayback: true, caption: legenda, mentions: [sorteado, sender] }, { quoted: message });
            else await sock.sendMessage(chat, { text: legenda, mentions: [sorteado, sender] }, { quoted: message });
        } catch(e) { return ctx.replyNYX("❌ Erro no sorteio.", "bot"); }
    }
};