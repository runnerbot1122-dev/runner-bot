const axios = require("axios");

const KNIGHTBOT_BASE_URL = String(process.env.KNIGHTBOT_BASE_URL || "https://knightbotapi.stream")
    .trim()
    .replace(/\/$/, "");
const KNIGHTBOT_API_KEY = String(process.env.KNIGHTBOT_API_KEY || "").trim();
const MAX_FILE_SIZE = 60 * 1024 * 1024;
const MAX_API_RESPONSE_SIZE = 2 * 1024 * 1024;

function exigirApiKey() {
    if (!KNIGHTBOT_API_KEY) {
        throw new Error("KNIGHTBOT_API_KEY não configurada.");
    }
}

function resolverUrlDownload(value) {
    if (!value || typeof value !== "string") return null;
    try {
        return new URL(value, `${KNIGHTBOT_BASE_URL}/`).toString();
    } catch (error) {
        return null;
    }
}

function extrairUrlOrigem(result) {
    const campos = ["url", "video_url", "original_url", "webpage_url", "source_url", "source"];
    for (const campo of campos) {
        const valor = result?.[campo];
        if (typeof valor === "string" && /^https?:\/\//i.test(valor)) return valor;
    }
    return null;
}

function mensagemErro(data, status) {
    const erro = data?.error || data?.message || data?.result?.error;
    return `KnightBot HTTP ${status}${erro ? `: ${erro}` : ""}`;
}

async function chamarKnightBot(rota, params = {}, timeout = 90000) {
    exigirApiKey();

    const response = await axios.get(`${KNIGHTBOT_BASE_URL}${rota}`, {
        params,
        timeout,
        responseType: "json",
        maxContentLength: MAX_API_RESPONSE_SIZE,
        maxBodyLength: MAX_API_RESPONSE_SIZE,
        validateStatus: () => true,
        headers: {
            Accept: "application/json",
            "X-API-Key": KNIGHTBOT_API_KEY,
            "User-Agent": "runner-bot-knightbot/1.0"
        }
    });

    if (response.status < 200 || response.status >= 300) {
        throw new Error(mensagemErro(response.data, response.status));
    }

    if (!response.data?.success || !response.data?.result || typeof response.data.result !== "object") {
        throw new Error(response.data?.error || "KnightBot retornou uma resposta sem result válido.");
    }

    return response.data;
}

async function baixarBuffer(url, options = {}) {
    const resolvedUrl = resolverUrlDownload(url);
    if (!resolvedUrl) throw new Error("KnightBot não retornou uma URL de download válida.");

    const response = await axios.get(resolvedUrl, {
        responseType: "arraybuffer",
        timeout: options.timeout || 300000,
        maxContentLength: MAX_FILE_SIZE,
        maxBodyLength: MAX_FILE_SIZE,
        headers: { "User-Agent": "runner-bot-knightbot/1.0" }
    });

    const buffer = Buffer.from(response.data || []);
    if (!buffer.length) throw new Error("KnightBot retornou um arquivo vazio.");
    if (buffer.length > MAX_FILE_SIZE) throw new Error("Arquivo KnightBot maior que 60 MB.");

    return {
        buffer,
        contentType: String(response.headers["content-type"] || "application/octet-stream").toLowerCase(),
        url: resolvedUrl
    };
}

function normalizarResult(result, fallbackUrl = null) {
    return {
        ...result,
        url: extrairUrlOrigem(result) || fallbackUrl || null,
        download_url: resolverUrlDownload(result.download),
        title: result.title || result.name || "Título desconhecido",
        thumbnail: result.thumbnail || result.thumb || result.image || null,
        duration: result.duration || null,
        channel: result.channel || result.author || result.uploader || null,
        views: result.views || null,
        upload_at: result.upload_at || result.uploadDate || null
    };
}

async function pesquisarYouTube(query) {
    const audioData = await chamarKnightBot("/api/download/ytaudio", {
        query,
        format: "128kbps"
    });

    let result = normalizarResult(audioData.result);

    // O fluxo do Play precisa da URL original para que os botões de vídeo,
    // áudio e documento continuem apontando para a mesma mídia.
    if (!result.url) {
        try {
            const videoData = await chamarKnightBot("/api/download/ytmp4", { query });
            result = {
                ...normalizarResult(videoData.result),
                ...result,
                url: extrairUrlOrigem(videoData.result)
            };
        } catch (error) {
            throw new Error(`KnightBot não retornou a URL original da pesquisa: ${error.message}`);
        }
    }

    return {
        ...audioData,
        result
    };
}

async function baixarAudio(url) {
    const data = await chamarKnightBot("/api/download/ytaudio", {
        url,
        format: "128kbps"
    });
    const arquivo = await baixarBuffer(data.result.download);
    const result = normalizarResult(data.result, url);

    return {
        audioBuffer: arquivo.buffer,
        title: result.title,
        fileName: `${result.title || "runner-play"}.mp3`,
        metadata: result,
        source: "knightbot"
    };
}

async function baixarVideo(url) {
    const data = await chamarKnightBot("/api/download/ytmp4", { url });
    const arquivo = await baixarBuffer(data.result.download);
    const result = normalizarResult(data.result, url);

    return {
        buffer: arquivo.buffer,
        title: result.title,
        fileName: `${result.title || "runner-play-video"}.mp4`,
        metadata: result,
        source: "knightbot"
    };
}

module.exports = {
    KNIGHTBOT_BASE_URL,
    MAX_FILE_SIZE,
    chamarKnightBot,
    pesquisarYouTube,
    baixarAudio,
    baixarVideo,
    baixarBuffer,
    normalizarResult
};
