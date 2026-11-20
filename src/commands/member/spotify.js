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
            // 1. Faz o scraping da página do Spotify para pegar o título
            // O Spotify bloqueia bots, então enviamos um User-Agent de navegador real
            const response = await axios.get(link, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            // Extrai a tag <title> da página do Spotify (geralmente é: Nome da Música - song by Artista | Spotify)
            const match = response.data.match(/<title>(.*?)<\/title>/);
            let nomeMusica = "";
            let nomeArtista = "";

            if (match && match[1]) {
                const tituloCompleto = match[1];
                // Separa "Música - song by Artista" ou similar
                const partes = tituloCompleto.split(" - song by ");
                if (partes.length === 2) {
                    nomeMusica = partes[0];
                    nomeArtista = partes[1].replace(" | Spotify", "").trim();
                } else {
                    nomeMusica = tituloCompleto.replace(" | Spotify", "").trim();
                }
            }

            if (!nomeMusica) {
                return replyNYX(ctx, "❌ Não consegui ler as informações dessa música no Spotify.", "bot");
            }

            await replyNYX(ctx, `🎵 Encontrei: *${nomeMusica}*\n👤 Artista: *${nomeArtista}*\n\n⬇️ Baixando do YouTube, aguarde...`, "bot");

            // 2. Pesquisa no YouTube para achar o áudio
            const termoBusca = `${nomeMusica} ${nomeArtista} audio`;
            const search = await yts(termoBusca);
            
            if (!search || !search.videos || search.videos.length === 0) {
                return replyNYX(ctx, "❌ Não consegui encontrar essa música no YouTube.", "bot");
            }

            const video = search.videos[0];

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
            await replyNYX(ctx, "❌ Erro ao baixar do Spotify. Verifique se o link é válido.", "bot");
        }
    }
};