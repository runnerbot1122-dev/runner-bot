const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const MAX_ANIMATION_BYTES = 8_000_000;
const CATEGORIES = new Set([
    "admin",
    "dono",
    "brincadeiras",
    "downloads",
    "ia"
]);
const STAGING_SEGMENTS = [
    "assets",
    "menus",
    "animacoes",
    ".staging"
];

function parseDeclaredSize(fileLength) {
    let declaredText;

    try {
        if (typeof fileLength === "number") {
            if (!Number.isSafeInteger(fileLength) || fileLength <= 0) {
                return null;
            }
            declaredText = String(fileLength);
        } else if (typeof fileLength === "bigint") {
            declaredText = fileLength.toString();
        } else if (typeof fileLength === "string") {
            declaredText = fileLength;
        } else if (fileLength && typeof fileLength.toString === "function") {
            declaredText = fileLength.toString();
        }
    } catch (_) {
        return null;
    }

    if (!declaredText || !/^\d+$/.test(declaredText)) {
        return null;
    }

    try {
        const size = BigInt(declaredText);
        if (size <= 0n || size > BigInt(Number.MAX_SAFE_INTEGER)) {
            return null;
        }
        return Number(size);
    } catch (_) {
        return null;
    }
}

function samePath(left, right, platform) {
    const normalizedLeft = path.resolve(left);
    const normalizedRight = path.resolve(right);
    return platform === "win32"
        ? normalizedLeft.toLowerCase() === normalizedRight.toLowerCase()
        : normalizedLeft === normalizedRight;
}

function getStagingDirectory(projectDirectory, platform = process.platform) {
    const projectRoot = fs.realpathSync(projectDirectory);
    let current = projectRoot;

    for (const segment of STAGING_SEGMENTS) {
        current = path.join(current, segment);

        try {
            fs.lstatSync(current);
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }

            try {
                fs.mkdirSync(current);
            } catch (mkdirError) {
                if (mkdirError.code !== "EEXIST") {
                    throw mkdirError;
                }
            }
        }

        const info = fs.lstatSync(current);
        if (!info.isDirectory() || info.isSymbolicLink()) {
            throw new Error("O caminho de staging contém um componente que não é diretório comum.");
        }

        const actualPath = fs.realpathSync(current);
        if (!samePath(actualPath, current, platform)) {
            throw new Error("O caminho de staging resolve para fora do diretório esperado.");
        }
    }

    return current;
}

function saveCandidate(stagingDirectory, filename, media) {
    const destination = path.join(stagingDirectory, filename);
    let descriptor;
    let created = false;

    try {
        descriptor = fs.openSync(destination, "wx", 0o600);
        created = true;
        fs.writeFileSync(descriptor, media);
        fs.closeSync(descriptor);
        descriptor = undefined;
        return destination;
    } catch (originalError) {
        if (descriptor !== undefined) {
            try {
                fs.closeSync(descriptor);
            } catch (_) {
                // Keep the original write/close error.
            }
        }

        if (created) {
            try {
                fs.unlinkSync(destination);
            } catch (_) {
                // Keep the original error; cleanup is best effort.
            }
        }

        throw originalError;
    }
}

function getQuotedVideo(ctx) {
    const quoted = ctx.message
        ?.message
        ?.extendedTextMessage
        ?.contextInfo
        ?.quotedMessage;

    if (!quoted || !quoted.videoMessage) {
        return null;
    }

    const mimetype = typeof quoted.videoMessage.mimetype === "string"
        ? quoted.videoMessage.mimetype.split(";")[0].trim().toLowerCase()
        : "";

    if (mimetype !== "video/mp4") {
        return null;
    }

    return { quoted, videoMessage: quoted.videoMessage };
}

module.exports = {
    name: "setanimacao",
    description: "Guarda um vídeo citado como candidato temporário de animação",

    execute: async (ctx) => {
        if (!ctx.isOwner) {
            return ctx.reply("❌ Apenas o dono pode usar este comando.");
        }

        if (!Array.isArray(ctx.args) || ctx.args.length !== 1) {
            return ctx.reply("❌ Use: 7setanimacao <admin|dono|brincadeiras|downloads|ia> citando um vídeo MP4.");
        }

        const category = typeof ctx.args[0] === "string"
            ? ctx.args[0].trim().toLowerCase()
            : "";
        if (!CATEGORIES.has(category)) {
            return ctx.reply("❌ Categoria inválida. Use: admin, dono, brincadeiras, downloads ou ia.");
        }

        const mediaInfo = getQuotedVideo(ctx);
        if (!mediaInfo) {
            return ctx.reply("❌ Cite uma mensagem de vídeo MP4 usando este comando.");
        }

        const declaredSize = parseDeclaredSize(mediaInfo.videoMessage.fileLength);
        if (declaredSize === null) {
            return ctx.reply("❌ Não foi possível validar o tamanho declarado do vídeo.");
        }
        if (declaredSize > MAX_ANIMATION_BYTES) {
            return ctx.reply("❌ O vídeo excede o limite de 8.000.000 bytes.");
        }

        let media;
        try {
            media = await downloadMediaMessage(
                { message: mediaInfo.quoted },
                "buffer",
                {},
                { logger: console }
            );
        } catch (error) {
            console.error("Erro ao baixar candidato de animação:", error);
            return ctx.reply("❌ Não foi possível receber o vídeo citado.");
        }

        if (!Buffer.isBuffer(media) || media.length === 0) {
            return ctx.reply("❌ O vídeo recebido não produziu um buffer válido.");
        }
        if (media.length > MAX_ANIMATION_BYTES) {
            return ctx.reply("❌ O vídeo recebido excede o limite de 8.000.000 bytes.");
        }

        let savedPath;
        try {
            const stagingDirectory = getStagingDirectory(process.cwd());
            const filename = `${category}-${randomUUID()}.mp4`;
            savedPath = saveCandidate(stagingDirectory, filename, media);
        } catch (error) {
            console.error("Erro ao guardar candidato de animação:", error);
            return ctx.reply("❌ Não foi possível guardar o vídeo na área temporária.");
        }

        return ctx.reply(
            `✅ Candidato temporário recebido para ${category}: ${path.basename(savedPath)}. Ele não foi validado como íntegro/decodificável e ainda não está ativo.`
        );
    }
};
