const axios = require("axios");

const YOUTUBE_ID_REGEX = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

function extractVideoId(url) {
    return String(url || "").match(YOUTUBE_ID_REGEX)?.[1] || null;
}

async function ytdlLocal(url, format = "mp4") {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) {
            return { status: false, mess: "URL do YouTube inválida." };
        }

        const normalizedFormat = String(format || "mp4").toLowerCase() === "mp4" ? "mp4" : "mp3";
        const client = axios.create({
            timeout: 60000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/141.0 Mobile Safari/537.36",
                Referer: "https://id.ytmp3.mobi/"
            }
        });

        const { data: init } = await client.get("https://d.ymcdn.org/api/v1/init", {
            params: { p: "y", 23: "1llum1n471", _: Math.random() }
        });

        if (!init?.convertURL) {
            return { status: false, mess: "Falha ao inicializar o conversor." };
        }

        const { data: convert } = await client.get(init.convertURL, {
            params: { v: videoId, f: normalizedFormat, _: Math.random() }
        });

        if (!convert?.progressURL || !convert?.downloadURL) {
            return { status: false, mess: "O conversor não retornou os dados necessários." };
        }

        let progress = 0;
        let title = convert.title || "";
        let attempts = 0;
        const maxAttempts = 20;

        while (progress < 3 && attempts < maxAttempts) {
            const { data } = await client.get(convert.progressURL);
            if (Number(data?.error || 0) > 0) {
                return { status: false, mess: `Erro do conversor: ${data.error}` };
            }

            progress = Number(data?.progress || 0);
            title = data?.title || title;
            if (progress < 3) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }

        if (progress < 3) {
            return { status: false, mess: "Tempo esgotado no conversor." };
        }

        return { status: true, title, dl: convert.downloadURL };
    } catch (error) {
        return { status: false, mess: `Erro no scraper local: ${error.message}` };
    }
}

module.exports = { ytdlLocal, extractVideoId };