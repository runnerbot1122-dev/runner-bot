const replyNYX = require("../../utils/replyNYX");
const { buscarEBaixarAudio } = require("../../utils/youtubeAudio");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const fonteNYX = require("../../utils/fonteNYX");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");
const { getBotName } = require("../../utils/botNameStore");

function unwrapMessage(message) {
    let atual = message || {};
    for (let i = 0; i < 6; i++) {
        const interno = atual.ephemeralMessage?.message || atual.viewOnceMessage?.message ||
            atual.viewOnceMessageV2?.message || atual.viewOnceMessageV2Extension?.message ||
            atual.documentWithCaptionMessage?.message || atual.editedMessage?.message;
        if (!interno) break;
        atual = interno;
    }
    return atual;
}

function quotedOf(message) {
    const atual = unwrapMessage(message?.message);
    for (const valor of Object.values(atual)) {
        const citado = valor?.contextInfo?.quotedMessage;
        if (citado) return unwrapMessage(citado);
    }
    return null;
}

function stickerOf(message) {
    const atual = unwrapMessage(message);
    return atual.stickerMessage || atual.audioStickerMessage?.message?.stickerMessage || null;
}

module.exports = {
    name: ["soundcloud", "sc"],
    description: "Baixa músicas (motor rápido)",
    execute: async (ctx) => {
        if (ctx.command === "sc") {
            const propria = unwrapMessage(ctx.message?.message);
            const citada = quotedOf(ctx.message);
            const temMidia = Boolean(
                stickerOf(propria) || stickerOf(citada) ||
                propria.imageMessage || propria.videoMessage || propria.audioMessage ||
                citada?.imageMessage || citada?.videoMessage || citada?.audioMessage
            );
            if (temMidia) {
                try {
                    const kit = await getSoundStickerKit();
                    const resultado = await kit.figurinha(ctx.sock, ctx.message, {
                        args: ctx.args.join(" "),
                        packname: getBotName(),
                        author: ctx.message?.pushName || "",
                        circle: true,
                        maxSeconds: 30
                    });
                    if (!resultado.ok) return replyNYX(ctx, `❌ ${resultado.erro || "Não consegui criar a figurinha redonda."}`, "bot");
                    return resultado;
                } catch (erro) {
                    console.error("[SC-CIRCULO] Erro:", erro.message);
                    return replyNYX(ctx, "❌ Não consegui criar a figurinha redonda.", "bot");
                }
            }
        }

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
