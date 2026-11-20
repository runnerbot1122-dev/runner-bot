const axios = require("axios");
const yt = require("@denzy-official/youtube_scraper");
const yts = require("yt-search");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

module.exports = {
    name: ["spotify", "spotifyplay"],
    description: "Baixa uma música do Spotify usando o YouTube",
    execute: async (ctx) => {
        const link = ctx.args[0];
        
        if (!link || !link.includes("spotify.com")) {
            return replyNYX(ctx, `🎵 *SPOTIFY*\n\nUso: *${ctx.prefix}spotify <link do Spotify>*\nEx: ${ctx.prefix}spotify https://open.spotify.com/track/...`, "bot");
        }

        await replyNYX(ctx, "🔍 Buscando informações no Spotify...", "bot");

        try {
            // 1. Usa a API OEmbed do Spotify (Nunca bloqueia e retorna o JSON certinho)
            const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(link)}`;
            const response = await axios.get(oembedUrl);
            
            const tituloCompleto = response.data.title; // Vem no formato: "Nome da Música"
            
            // O título as vezes vem como "Música - song by Artista" ou só o nome da música
            let nomeMusica = tituloCompleto;
            let nomeArtista = "";

            if (tituloCompleto.includes(" - song by ")) {
                const partes = tituloCompleto.split(" - song by ");
                nomeMusica = partes[0];
                nomeArtista = partes[1].trim();
            }

            if (!nomeMusica) {
                return replyNYX(ctx, "❌ Não consegui ler as informações dessa música no Spotify.", "bot");
            }

            await replyNYX(ctx, `🎵 Encontrei: *${nomeMusica}*\n👤 Artista: *${nomeArtista || 'Desconhecido'}*\n\n⬇️ Baixando do Spotify, aguarde...`, "bot");

            // 2. Pesquisa no YouTube
            const termoBusca = `${nomeMusica} ${nomeArtista} audio`;
            const search = await yts(termoBusca);
            
            if (!search || !search.videos || search.videos.length === 0) {
                return replyNYX(ctx, "❌ Não consegui encontrar essa música no Spotify.", "bot");
            }

            // Pega o primeiro vídeo (que não seja um shorts ou compilado gigante)
            const video = search.videos.find(v => v.seconds < 600) || search.videos[0];

            // 3. Usa a API do Denzy para pegar o link do MP3
            const apiRes = await yt.ytmp3(video.url);
            
            if (!apiRes || !apiRes.download || !apiRes.download.url) {
                throw new Error("A API não retornou um link válido.");
            }

            // 4. Baixa o buffer do áudio
            const audioResponse = await axios.get(apiRes.download.url, {
                responseType: "arraybuffer",
                timeout: 20000
            });

            // 5. Envia o áudio
            await sendNYXMedia(ctx.sock, ctx.chat, {
                audio: Buffer.from(audioResponse.data),
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: `${nomeMusica.replace(/[\\/:*?"<>|]/g, '_')}.mp3`
            }, ctx.message);

        } catch (error) {
            console.error("[SPOTIFY] Erro:", error.message);
            await replyNYX(ctx, "❌ Erro ao baixar do Spotify. Verifique se o link é de uma música válida.", "bot");
        }
    }
};