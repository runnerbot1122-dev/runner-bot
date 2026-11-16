const path = require("path");
const fonteNYX = require("../../utils/fonteNYX");
const criarPlayCard = require("../../utils/createPlayCard");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { buscarEBaixarAudio } = require("../../utils/youtubeAudio");

module.exports = {
    name: "play",
    description: "Pesquisa músicas no YouTube e envia o áudio",
    execute: async (ctx) => {
        const pesquisa = (Array.isArray(ctx.args) ? ctx.args : []).join(" ").trim();
        if (!pesquisa) {
            return ctx.replyNYX(`${fonteNYX("PESQUISAR MÚSICA")}\n\nUso: 7play nome da música`, "bot");
        }

        await ctx.replyNYX("🔍 Buscando e preparando a música...", "bot");

        try {
            console.time("⏱️ 1. Download (Denzy)");
            const faixa = await buscarEBaixarAudio(pesquisa);
            console.timeEnd("⏱️ 1. Download (Denzy)");

            if (!faixa || !faixa.audioBuffer) {
                return ctx.replyNYX("Não encontrei essa faixa.", "bot");
            }

            const legenda = ` ${fonteNYX(faixa.title)}\n ${fonteNYX(faixa.artist)}\n ${fonteNYX("Áudio do YouTube")}`;

            try {
                if (faixa.thumbnailUrl) {
                    const cartao = await criarPlayCard({
                        fundoPath: path.resolve("assets/menus/principal.jpg"),
                        capaUrl: faixa.thumbnailUrl,
                        titulo: faixa.title,
                        artista: faixa.artist
                    });
                    await sendNYXMedia(ctx.sock, ctx.chat, { image: cartao, mimetype: "image/png", caption: legenda }, ctx.message);
                } else {
                    await ctx.replyNYX(legenda, "bot");
                }
            } catch (cardErro) {
                console.error("[PLAY CARD FALHOU]", cardErro.message);
                await ctx.replyNYX(legenda, "bot");
            }

            const audio = {
                audio: faixa.audioBuffer,
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: faixa.fileName || "runner-play.mp3"
            };

            console.time("⏱️ 2. Envio pro WhatsApp");
            try {
                await sendNYXMedia(ctx.sock, ctx.chat, audio, ctx.message);
                console.timeEnd("⏱️ 2. Envio pro WhatsApp");
            } catch (e) {
                console.error("[PLAY AUDIO FALHOU]", e.message);
                await ctx.reply(audio);
            }

        } catch (error) {
            console.error("[PLAY]", error);
            return ctx.replyNYX("Não consegui buscar ou enviar a música. Tente novamente.", "bot");
        }
    }
};
