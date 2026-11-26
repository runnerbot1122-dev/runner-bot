const crypto = require("crypto");
const { Image } = require("node-webpmux");
const { getSoundStickerKit } = require("./soundStickerKit");

async function findSticker(message) {
    const kit = await getSoundStickerKit();
    const quoted = kit.quotedOf(message);
    return kit.stickerOf(quoted) || kit.stickerOf(kit.unwrapMessage(message?.message || message));
}

async function downloadSticker(ctx, stickerMessage) {
    const kit = await getSoundStickerKit();
    return kit.downloadMedia(stickerMessage, "sticker");
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
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    return {
        id: hash.slice(0, 16),
        hash,
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

module.exports = { findSticker, downloadSticker, readStickerInfo, formatBytes };
