const path = require("path");
const fonteNYX = require("../../utils/fonteNYX");
const criarPlayCard = require("../../utils/createPlayCard");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { buscarEBaixarAudio } = require("../../utils/youtubeAudio");

let ultimaFrase = -1;

function nomeErroPlay(error) {
    if (error?.code === "ENOENT") return "Não encontrei o yt-dlp na VPS.";
    if (error?.code === "PLAY_BUSY") return "Aguarde, o play anterior ainda está rodando.";
    if (error?.code === "OOM") return "Hospedagem sem memória. Tente uma música mais curta.";
    if (error?.code === "TIMEOUT") return "O YouTube demorou muito. Tente novamente.";
    return "Não consegui buscar ou enviar a música. Tente novamente.";
}

module.exports = {
    name: "play",
    description: "Pesquisa músicas no YouTube e envia o áudio MP3",
    execute: async ctx => {
        const pesquisa = (Array.isArray(ctx.args) ? ctx.args : []).join(" ").trim();

        if (!pesquisa) {
            return ctx.replyNYX(`${fonteNYX("PESQUISAR MÚSICA")}\n\nUso: 7play nome da música`, "bot");
        }

        const frases = [
            "Calma, tô preparando seu pedido.", "Separando o som, já vai tocar.",
            "Buscando sua música, já volto.", "O próximo som está chegando."
        ];
        
        let indice;
        do { indice = Math.floor(Math.random() * frases.length); } while (frases.length > 1 && indice === ultimaFrase);
        ultimaFrase = indice;

        await ctx.replyNYX(frases[indice], "bot");

        try {
            const faixa = await buscarEBaixarAudio(pesquisa);

            if (!faixa || !faixa.audioBuffer || faixa.audioBuffer.length === 0) {
                return ctx.replyNYX("Não encontrei essa faixa.", "bot");
            }

            const legenda = `🎵 ${fonteNYX(faixa.title)}\n👤 ${fonteNYX(faixa.artist)}\n🎼 ${fonteNYX("YouTube")}`;

            // Tenta enviar o card primeiro
            try {
                if (faixa.thumbnailUrl) {
                    const cartao = await criarPlayCard({
                        fundoPath: path.resolve("assets/menus/principal.jpg"),
                        capaUrl: faixa.thumbnailUrl,
                        titulo: faixa.title,
                        artista: faixa.artist
                    });
                    await sendNYXMedia(ctx.sock, ctx.chat, {
                        image: cartao,
                        mimetype: "image/png",
                        caption: legenda
                    }, ctx.message);
                } else {
                    await ctx.replyNYX(legenda, "bot");
                }
            } catch (cardErro) {
                console.error("[PLAY CARD FALHOU]", cardErro.message);
                // Se o card falhar, envia só a legenda por texto
                await ctx.replyNYX(legenda, "bot");
            }

            // Envia o áudio depois
            const audio = {
                audio: faixa.audioBuffer,
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: faixa.fileName || "runner-play.mp3"
            };

            try {
                await sendNYXMedia(ctx.sock, ctx.chat, audio, ctx.message);
            } catch (e) {
                console.error("[PLAY AUDIO FALHOU]", e.message);
                await ctx.reply(audio);
            }

        } catch (error) {
            console.error("[PLAY]", error);
            return ctx.replyNYX(nomeErroPlay(error), "bot");
        }
    }
};