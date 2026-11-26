// Adaptador CommonJS para o kit ESM de figurinhas com som.
// O módulo Baileys é sempre o mesmo usado por src/core/connection.js.
let kitPromise = null;

function getSoundStickerKit() {
    if (!kitPromise) {
        kitPromise = import("../../figurinha-com-som/lib/index.mjs")
            .then((kit) => {
                const baileys = require("@whiskeysockets/baileys");
                const instalado = kit.useBaileys(baileys);
                if (!instalado || !kit.stickerAudioReady()) {
                    throw new Error("Não foi possível instalar o suporte a figurinha com som nesta versão do Baileys.");
                }
                return kit;
            })
            .catch((erro) => {
                kitPromise = null;
                throw erro;
            });
    }
    return kitPromise;
}

function serializarClip(clip) {
    if (!clip?.ogg?.length) return null;
    return {
        ogg: Buffer.from(clip.ogg).toString("base64"),
        seconds: Math.max(1, Number(clip.seconds) || 1),
        waveform: Buffer.from(clip.waveform || []).toString("base64")
    };
}

function desserializarClip(data) {
    if (!data || typeof data.ogg !== "string" || !data.ogg) return null;
    try {
        const ogg = Buffer.from(data.ogg, "base64");
        if (!ogg.length) return null;
        return {
            ogg,
            seconds: Math.max(1, Number(data.seconds) || 1),
            waveform: typeof data.waveform === "string" ? Buffer.from(data.waveform, "base64") : Buffer.alloc(64)
        };
    } catch (_) {
        return null;
    }
}

async function enviarFigurinha(sock, jid, { webp, clip = null, quoted, mentions } = {}) {
    if (clip?.ogg?.length) {
        const kit = await getSoundStickerKit();
        return kit.sendSoundSticker(sock, jid, { webp, clip, quoted, mentions });
    }
    return sock.sendMessage(jid, { sticker: webp, ...(mentions?.length ? { mentions } : {}) }, quoted ? { quoted } : {});
}

module.exports = {
    getSoundStickerKit,
    serializarClip,
    desserializarClip,
    enviarFigurinha
};
