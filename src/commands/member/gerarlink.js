const axios = require("axios");
const FormData = require("form-data");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const replyNYX = require("../../utils/replyNYX");

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

function unwrapMessage(message) {
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

function getMediaFromContext(message) {
    const current = unwrapMessage(message?.message || message);
    const types = [
        "imageMessage",
        "videoMessage",
        "audioMessage",
        "documentMessage",
        "stickerMessage"
    ];

    for (const type of types) {
        if (current[type]) return { type, content: current[type] };
    }

    const quoted = unwrapMessage(
        current.extendedTextMessage?.contextInfo?.quotedMessage
    );

    for (const type of types) {
        if (quoted[type]) return { type, content: quoted[type] };
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
        const media = getMediaFromContext(ctx.message);

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

            const buffer = await downloadMediaMessage(
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

            return replyNYX(
                ctx,
                `✅ Link gerado com sucesso!\n\n🔗 ${url}`,
                "bot"
            );
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
