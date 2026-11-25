const axios = require("axios");

const NEXRAY_BASE = "https://api.nexray.web.id";
const NEXRAY_USER_AGENT = "NexRay-API-Client/1.0.0";
const NEXRAY_MAX_RETRIES = 3;
const MAX_FILE_SIZE = 60 * 1024 * 1024;
const MAX_API_RESPONSE_SIZE = 2 * 1024 * 1024;

function isHttpUrl(value) {
    try {
        const url = new URL(String(value));
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
        return false;
    }
}

function findUrl(value, key = "") {
    if (typeof value === "string") {
        return isHttpUrl(value) ? value : null;
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const found = findUrl(item, key);
            if (found) return found;
        }
        return null;
    }

    if (!value || typeof value !== "object") return null;

    const preferredKeys = ["download", "video", "image", "media", "file", "url", "link", "src"];
    for (const preferred of preferredKeys) {
        for (const [objectKey, objectValue] of Object.entries(value)) {
            if (objectKey.toLowerCase().includes(preferred)) {
                const found = findUrl(objectValue, objectKey);
                if (found) return found;
            }
        }
    }

    for (const [objectKey, objectValue] of Object.entries(value)) {
        const found = findUrl(objectValue, objectKey);
        if (found) return found;
    }

    return null;
}

function findError(value) {
    if (!value || typeof value !== "object") return "A NexRay recusou o download.";
    return value.error || value.message || value.result?.error || "A NexRay recusou o download.";
}

async function downloadBuffer(url, options = {}) {
    const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: options.timeout || 120000,
        maxContentLength: MAX_FILE_SIZE,
        maxBodyLength: MAX_FILE_SIZE,
        validateStatus: () => true,
        headers: {
            Accept: options.accept || "video/*, image/*, application/octet-stream",
            "User-Agent": NEXRAY_USER_AGENT
        }
    });

    const contentType = String(response.headers["content-type"] || "application/octet-stream").toLowerCase();
    const buffer = Buffer.from(response.data || []);

    if (response.status < 200 || response.status >= 300) {
        throw new Error(`Download retornou HTTP ${response.status}`);
    }

    if (contentType.includes("text/html") || contentType.includes("application/json")) {
        throw new Error("A NexRay retornou uma página ou JSON em vez de mídia");
    }

    if (!buffer.length || buffer.length > MAX_FILE_SIZE) {
        throw new Error("A mídia está vazia ou ultrapassa 60 MB");
    }

    return { buffer, contentType };
}

async function nexrayDownload(route, sourceUrl, options = {}) {
    let response;
    let lastError;
    const query = options.params || { url: sourceUrl };
    const maxRetries = options.maxRetries ?? NEXRAY_MAX_RETRIES;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            response = await axios.get(`${NEXRAY_BASE}${route}`, {
                params: query,
                responseType: "arraybuffer",
                timeout: 30000,
                maxContentLength: MAX_API_RESPONSE_SIZE,
                maxBodyLength: MAX_API_RESPONSE_SIZE,
                validateStatus: () => true,
                headers: {
                    Accept: "application/json, video/*, image/*, application/octet-stream",
                    "Content-Type": "application/json",
                    "User-Agent": NEXRAY_USER_AGENT
                }
            });

            if (response.status < 500 || attempt === maxRetries) break;
        } catch (error) {
            lastError = error;
            if (attempt === maxRetries) throw error;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!response) throw lastError || new Error("NexRay não respondeu");

    const contentType = String(response.headers["content-type"] || "").toLowerCase();
    const body = Buffer.from(response.data || []);

    if (response.status < 200 || response.status >= 300) {
        let data = null;
        try {
            data = JSON.parse(body.toString("utf8"));
        } catch (error) {}
        throw new Error(`NexRay HTTP ${response.status}: ${findError(data)}`);
    }

    if (contentType.startsWith("video/") || contentType.startsWith("image/") || contentType === "application/octet-stream") {
        if (!body.length || body.length > MAX_FILE_SIZE) throw new Error("Mídia NexRay inválida");
        return { buffer: body, contentType, source: "nexray" };
    }

    let data;
    try {
        data = JSON.parse(body.toString("utf8"));
    } catch (error) {
        throw new Error("Resposta NexRay não é JSON nem mídia");
    }

    if (data?.status === false) {
        throw new Error(findError(data));
    }

    const mediaUrl = findUrl(data);
    if (!mediaUrl) throw new Error("NexRay não retornou URL de mídia");

    const media = await downloadBuffer(mediaUrl);
    return { ...media, source: "nexray", mediaUrl, metadata: data };
}

module.exports = {
    NEXRAY_BASE,
    MAX_FILE_SIZE,
    isHttpUrl,
    nexrayDownload,
    downloadBuffer
};