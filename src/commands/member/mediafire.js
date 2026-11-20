const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

const MAX_FILE_SIZE = 60 * 1024 * 1024;
const MEDIAFIRE_HOSTS = new Set(["mediafire.com", "www.mediafire.com"]);

function isMediaFireUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) && MEDIAFIRE_HOSTS.has(url.hostname.toLowerCase());
    } catch (error) {
        return false;
    }
}

function decodeHtml(value) {
    return String(value || "")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\\\//g, "/")
        .replace(/\\u0026/gi, "&");
}

function extractDownloadUrl(html) {
    const source = decodeHtml(html);
    const patterns = [
        /https?:\/\/download\d+\.mediafire\.com\/[^^\s"'<>\\]+/i,
        /(?:href|data-href|aria-label)=["'](https?:\/\/[^"']*mediafire[^"']+)["']/i,
        /downloadButton[^>]+href=["']([^"']+)["']/i
    ];

    for (const pattern of patterns) {
        const match = source.match(pattern);
        if (!match) continue;
        const candidate = decodeHtml(match[1] || match[0]).replace(/[&].*$/, value => value);
        try {
            const url = new URL(candidate, "https://www.mediafire.com");
            if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
        } catch (error) {}
    }

    return null;
}

function fileNameFromResponse(response, downloadUrl) {
    const disposition = response.headers["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8''|\")?([^;\"]+)/i);
    if (match?.[1]) return decodeURIComponent(match[1].trim().replace(/^"|"$/g, ""));

    try {
        const pathname = new URL(downloadUrl).pathname;
        const last = pathname.split("/").filter(Boolean).pop();
        if (last && /\.[a-z0-9]{2,8}$/i.test(last)) return decodeURIComponent(last);
    } catch (error) {}

    return "arquivo-mediafire";
}

module.exports = {
    name: ["mediafire"],
    description: "Baixa um arquivo público do MediaFire",

    execute: async ctx => {
        const link = ctx.args?.[0];

        if (!link || !isMediaFireUrl(link)) {
            return replyNYX(
                ctx,
                `📦 Envie um link válido do MediaFire.\n\nUso: ${ctx.prefix}mediafire https://www.mediafire.com/file/...`,
                "bot"
            );
        }

        try {
            await ctx.react("📦");
        } catch (error) {}

        try {
            await ctx.reply("📦 Obtendo o arquivo do MediaFire, aguarde...");

            const page = await axios.get(link, {
                timeout: 30000,
                maxContentLength: 8 * 1024 * 1024,
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            const downloadUrl = extractDownloadUrl(page.data);
            if (!downloadUrl) throw new Error("Link direto não encontrado.");

            const response = await axios.get(downloadUrl, {
                responseType: "arraybuffer",
                timeout: 120000,
                maxContentLength: MAX_FILE_SIZE,
                maxBodyLength: MAX_FILE_SIZE,
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            const contentType = String(response.headers["content-type"] || "application/octet-stream");
            if (contentType.includes("text/html")) {
                throw new Error("MediaFire retornou uma página em vez do arquivo.");
            }

            const buffer = Buffer.from(response.data);
            if (!buffer.length || buffer.length > MAX_FILE_SIZE) {
                throw new Error("Arquivo vazio ou maior que o limite.");
            }

            await sendNYXMedia(ctx.sock, ctx.chat, {
                document: buffer,
                mimetype: contentType,
                fileName: fileNameFromResponse(response, downloadUrl),
                caption: "📦 Arquivo baixado do MediaFire"
            }, ctx.message);
        } catch (error) {
            console.error("[MEDIAFIRE] Erro:", error.message);
            return replyNYX(
                ctx,
                "❌ Não consegui baixar esse arquivo. O link pode ser privado, expirado ou protegido pelo MediaFire.",
                "bot"
            );
        }
    }
};
