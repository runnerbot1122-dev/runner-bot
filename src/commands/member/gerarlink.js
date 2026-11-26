const axios = require("axios");
const FormData = require("form-data");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const replyNYX = require("../../utils/replyNYX");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

function unwrapMessage(message) {
    let current = message || {};
    for (let i = 0; i < 6; i++) {
        const inner = current.ephemeralMessage?.message || current.viewOnceMessage?.message ||
            current.viewOnceMessageV2?.message || current.viewOnceMessageV2Extension?.message ||
            current.documentWithCaptionMessage?.message || current.editedMessage?.message;
        if (!inner) break;
        current = inner;
    }
    return current;
}

function quotedOf(message) {
    const current = unwrapMessage(message?.message);
    for (const value of Object.values(current)) {
        const quoted = value?.contextInfo?.quotedMessage;
        if (quoted) return unwrapMessage(quoted);
    }
    return null;
}

function stickerOf(message) {
    const current = unwrapMessage(message);
    return current.stickerMessage || current.audioStickerMessage?.message?.stickerMessage || null;
}

async function getMediaFromContext(message) {
    const current = unwrapMessage(message?.message || message);
    const quoted = quotedOf(message);
    const types = ["imageMessage", "videoMessage", "audioMessage", "documentMessage"];

    for (const type of types) {
        if (current[type]) return { type, content: current[type] };
    }
    for (const type of types) {
        if (quoted?.[type]) return { type, content: quoted[type] };
    }

    const sticker = stickerOf(current) || stickerOf(quoted);
    if (sticker) {
        const kit = await getSoundStickerKit();
        return { type: "stickerMessage", content: sticker, clip: await kit.getStickerSound(sticker) };
    }
    return null;
}

function extensionFor(type, mimetype = "") {
    const mime = String(mimetype).toLowerCase();
    const byMime = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "video/mp4": ".mp4",
        "audio/mpeg": ".mp3",
        "audio/ogg": ".ogg",
        "application/pdf": ".pdf"
    };

    if (byMime[mime]) return byMime[mime];
    if (type === "imageMessage") return ".jpg";
    if (type === "videoMessage") return ".mp4";
    if (type === "audioMessage") return ".mp3";
    if (type === "stickerMessage") return ".webp";
    return ".bin";
}

function fileNameFor(type, content) {
    const original = content?.fileName || content?.fileName?.toString();
    if (original && !/[\\/]/.test(original)) return original;
    return `runnerbot${extensionFor(type, content?.mimetype)}`;
}

module.exports = {
    name: ["gerarlink"],
    description: "Gera um link público para uma mídia respondida",

    execute: async ctx => {
        const media = await getMediaFromContext(ctx.message);

        if (!media) {
            return replyNYX(
                ctx,
                `🔗 Responda a uma imagem, vídeo, áudio ou documento com ${ctx.prefix}gerarlink.`,
                "bot"
            );
        }

        try {
            await ctx.react("🔗");
        } catch (error) {}

        try {
            const messageToDownload = {
                key: ctx.message.key,
                message: { [media.type]: media.content }
            };

            const buffer = media.type === "stickerMessage"
                ? await (await getSoundStickerKit()).downloadMedia(media.content, "sticker")
                : await downloadMediaMessage(
                    messageToDownload,
                    "buffer",
                    {},
                    {
                        logger: console,
                        reuploadRequest: ctx.sock.updateMediaMessage
                    }
                );

            if (!buffer || buffer.length === 0) {
                throw new Error("Mídia vazia.");
            }

            if (buffer.length > MAX_UPLOAD_SIZE) {
                return replyNYX(ctx, "❌ A mídia deve ter no máximo 50 MB.", "bot");
            }

            const form = new FormData();
            form.append("reqtype", "fileupload");
            form.append("fileToUpload", buffer, {
                filename: fileNameFor(media.type, media.content),
                contentType: media.content?.mimetype || "application/octet-stream"
            });

            await ctx.reply("🔗 Gerando o link, aguarde...");

            const response = await axios.post("https://catbox.moe/user/api.php", form, {
                headers: form.getHeaders(),
                timeout: 90000,
                maxContentLength: 2 * 1024 * 1024,
                maxBodyLength: MAX_UPLOAD_SIZE + 1024 * 1024
            });

            const url = String(response.data || "").trim();
            if (!/^https?:\/\/[^\s]+$/i.test(url)) {
                throw new Error("O serviço não retornou uma URL válida.");
            }

            let retorno = `✅ Link gerado com sucesso!\n\n🔗 ${url}`;
            if (media.clip?.ogg?.length) {
                const formSom = new FormData();
                formSom.append("reqtype", "fileupload");
                formSom.append("fileToUpload", media.clip.ogg, {
                    filename: "runnerbot-som.ogg",
                    contentType: "audio/ogg"
                });
                const respostaSom = await axios.post("https://catbox.moe/user/api.php", formSom, {
                    headers: formSom.getHeaders(),
                    timeout: 90000,
                    maxContentLength: 2 * 1024 * 1024,
                    maxBodyLength: MAX_UPLOAD_SIZE + 1024 * 1024
                });
                const urlSom = String(respostaSom.data || "").trim();
                if (/^https?:\/\/[^\s]+$/i.test(urlSom)) {
                    retorno += `\n\n🔊 Link do áudio: ${urlSom}\nℹ️ O link WebP, sozinho, não reproduz o som integrado.`;
                }
            }
            return replyNYX(ctx, retorno, "bot");
        } catch (error) {
            console.error("[GERARLINK] Erro:", error.message);
            return replyNYX(
                ctx,
                "❌ Não consegui gerar o link. Tente novamente com uma mídia menor.",
                "bot"
            );
        }
    }
};
