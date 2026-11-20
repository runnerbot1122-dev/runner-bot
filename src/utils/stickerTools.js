const crypto = require("crypto");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { Image } = require("node-webpmux");

function unwrap(message) {
    let current = message || {};

    while (
        current.viewOnceMessage ||
        current.viewOnceMessageV2 ||
        current.viewOnceMessageV2Extension ||
        current.documentWithCaptionMessage
    ) {
        current =
            current.viewOnceMessage ||
            current.viewOnceMessageV2 ||
            current.viewOnceMessageV2Extension ||
            current.documentWithCaptionMessage;
        current = current.message || current;
    }

    return current;
}

function findSticker(message) {
    const current = unwrap(message?.message || message);
    if (current.stickerMessage) return current.stickerMessage;

    const quoted = unwrap(current.extendedTextMessage?.contextInfo?.quotedMessage);
    return quoted.stickerMessage || null;
}

async function downloadSticker(ctx, stickerMessage) {
    return downloadMediaMessage(
        {
            key: ctx.message.key,
            message: { stickerMessage }
        },
        "buffer",
        {},
        {
            logger: console,
            reuploadRequest: ctx.sock.updateMediaMessage
        }
    );
}

function parseExif(exif) {
    const fallback = {
        packname: "Desconhecido",
        author: "Desconhecido",
        packid: "Desconhecido",
        publisher: "Desconhecido",
        raw: null
    };

    if (!exif) return fallback;

    const text = Buffer.from(exif).toString("utf8");
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return fallback;

    try {
        const data = JSON.parse(text.slice(start, end + 1));
        return {
            packname: data["sticker-pack-name"] || fallback.packname,
            author: data["sticker-pack-publisher"] || fallback.author,
            packid: data["sticker-pack-id"] || fallback.packid,
            publisher: data["sticker-pack-publisher"] || fallback.publisher,
            raw: data
        };
    } catch (error) {
        return fallback;
    }
}

async function readStickerInfo(buffer) {
    const image = new Image();
    await image.load(buffer);
    const metadata = parseExif(image.exif);

    return {
        id: crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16),
        hash: crypto.createHash("sha256").update(buffer).digest("hex"),
        size: buffer.length,
        width: image.width || "Desconhecida",
        height: image.height || "Desconhecida",
        exifSize: image.exif ? image.exif.length : 0,
        ...metadata
    };
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return "Desconhecido";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

module.exports = {
    findSticker,
    downloadSticker,
    readStickerInfo,
    formatBytes
};
