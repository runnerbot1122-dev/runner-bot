const replyNYX = require("../../utils/replyNYX");
const { buscarEBaixarAudio } = require("../../utils/youtubeAudio");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["soundcloud", "sc"],
    description: "Baixa músicas (motor rápido)",
    execute: async (ctx) => {
        const pesquisa = ctx.args.join(" ").trim();
        
        if (!pesquisa) {
            return replyNYX(ctx, `☁️ *BAIXAR MÚSICA*\n\nUso: ${ctx.prefix}soundcloud [nome ou link]\nEx: ${ctx.prefix}soundcloud lofi hip hop`, "bot");
        }

        try { await ctx.react("☁️"); } catch (e) {}
        
        await ctx.reply("🎵 Baixando sua música, aguarde...");

        try {
            // Usa o motor do play (YouTube) que é mais rápido e não tem o bloqueio do JS runtime do SoundCloud
            // Passamos o termo de busca como "ytsearch1:pesquisa"
            const faixa = await buscarEBaixarAudio(pesquisa);

            if (!faixa || !faixa.audioBuffer) {
                return replyNYX(ctx, "❌ Não consegui encontrar essa música.", "bot");
            }

            // Envia como áudio normal
            await sendNYXMedia(ctx.sock, ctx.chat, {
                audio: faixa.audioBuffer,
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: `${fonteNYX(faixa.title.substring(0, 20).replace(/[\\/:*?"<>|]/g, '_'))}.mp3`
            }, ctx.message);

        } catch (error) {
            console.error("[SOUNDCLOUD] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui baixar essa música. Tente novamente.", "bot");
        }
    }
};