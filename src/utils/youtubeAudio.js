const yts = require("yt-search");
const yt = require("@denzy-official/youtube_scraper");
const axios = require("axios");

async function buscarEBaixarAudio(query) {
    try {
        const search = await yts(query);
        if (!search || !search.videos || search.videos.length === 0) {
            throw new Error("Nenhum vídeo encontrado no YouTube.");
        }

        const video = search.videos[0];
        const url = video.url;

        // Extração via Denzy (Rápido, não usa CPU)
        const apiRes = await yt.ytmp3(url);
        
        if (!apiRes || !apiRes.download || !apiRes.download.url) {
            throw new Error("A API do Denzy não retornou um link válido.");
        }

        const audioResponse = await axios.get(apiRes.download.url, {
            responseType: "arraybuffer",
            timeout: 20000
        });

        return {
            audioBuffer: Buffer.from(audioResponse.data),
            title: video.title || query,
            artist: video.author?.name || "Desconhecido",
            thumbnailUrl: video.thumbnail,
            fileName: `${String(video.title || query).replace(/[\\/:*?"<>|]/g, '_')}.mp3`
        };

    } catch (error) {
        console.error("[YOUTUBE AUDIO] Erro:", error.message);
        throw error;
    }
}

module.exports = { buscarEBaixarAudio };
