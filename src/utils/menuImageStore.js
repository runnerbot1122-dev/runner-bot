const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { Jimp } = require("jimp");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const MAX_INPUT_BYTES = 8_000_000;
const MAX_IMAGE_DIMENSION = 4096;
const MAX_IMAGE_PIXELS = 12_000_000;
const PNG_SIGNATURE = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);
const JPEG_START = Buffer.from([0xff, 0xd8]);
const JPEG_FRAME_MARKERS = new Set([
    0xc0, 0xc1, 0xc2, 0xc3,
    0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb,
    0xcd, 0xce, 0xcf
]);

function parsePngDimensions(buffer) {
    if (buffer.length < 33) {
        throw new Error("Cabeçalho PNG incompleto.");
    }

    if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
        throw new Error("Assinatura PNG inválida.");
    }

    if (
        buffer.readUInt32BE(8) !== 13 ||
        buffer.toString("ascii", 12, 16) !== "IHDR"
    ) {
        throw new Error("Cabeçalho IHDR inválido.");
    }

    return {
        mime: "image/png",
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20)
    };
}

function parseJpegDimensions(buffer) {
    if (buffer.length < 4 || !buffer.subarray(0, 2).equals(JPEG_START)) {
        throw new Error("Assinatura JPEG inválida ou incompleta.");
    }

    let offset = 2;
    while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) {
            throw new Error("Estrutura JPEG inválida antes do quadro.");
        }

        while (offset < buffer.length && buffer[offset] === 0xff) {
            offset += 1;
        }

        if (offset >= buffer.length) {
            throw new Error("Marcador JPEG incompleto.");
        }

        const marker = buffer[offset++];
        if (marker === 0x00) {
            throw new Error("Marcador JPEG inválido antes do quadro.");
        }

        if (marker === 0xd9 || marker === 0xda) {
            break;
        }

        const standaloneMarker = marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7);
        if (standaloneMarker) {
            continue;
        }

        if (offset + 2 > buffer.length) {
            throw new Error("Comprimento do segmento JPEG incompleto.");
        }

        const segmentLength = buffer.readUInt16BE(offset);
        if (
            segmentLength < 2 ||
            offset + segmentLength > buffer.length
        ) {
            throw new Error("Segmento JPEG truncado ou inválido.");
        }

        if (JPEG_FRAME_MARKERS.has(marker)) {
            if (segmentLength < 8) {
                throw new Error("Segmento de dimensões JPEG incompleto.");
            }

            return {
                mime: "image/jpeg",
                height: buffer.readUInt16BE(offset + 3),
                width: buffer.readUInt16BE(offset + 5)
            };
        }

        offset += segmentLength;
    }

    throw new Error("Dimensões do quadro JPEG não encontradas.");
}

function inspectImageHeader(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error("A imagem recebida não é um buffer válido.");
    }

    if (buffer.length > MAX_INPUT_BYTES) {
        throw new Error("A imagem excede o limite de 8 MB.");
    }

    let header;
    if (
        buffer.length >= PNG_SIGNATURE.length &&
        buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
    ) {
        header = parsePngDimensions(buffer);
    } else if (
        buffer.length >= JPEG_START.length &&
        buffer.subarray(0, JPEG_START.length).equals(JPEG_START)
    ) {
        header = parseJpegDimensions(buffer);
    } else {
        throw new Error("Formato não permitido. Envie JPEG ou PNG.");
    }

    if (
        !Number.isInteger(header.width) ||
        !Number.isInteger(header.height) ||
        header.width <= 0 ||
        header.height <= 0
    ) {
        throw new Error("Dimensões da imagem inválidas.");
    }

    if (
        header.width > MAX_IMAGE_DIMENSION ||
        header.height > MAX_IMAGE_DIMENSION ||
        header.width * header.height > MAX_IMAGE_PIXELS
    ) {
        throw new Error("A imagem excede os limites de dimensão permitidos.");
    }

    return header;
}

function validateDecodedDimensions(image) {
    const { width, height } = image.bitmap;
    if (
        !Number.isInteger(width) ||
        !Number.isInteger(height) ||
        width <= 0 ||
        height <= 0 ||
        width > MAX_IMAGE_DIMENSION ||
        height > MAX_IMAGE_DIMENSION ||
        width * height > MAX_IMAGE_PIXELS
    ) {
        throw new Error("Dimensões decodificadas fora dos limites permitidos.");
    }
}

function tamanhoDeclaradoExcedeLimite(fileLength) {
    let declarado;
    try {
        if (typeof fileLength === "number") {
            declarado = Number.isFinite(fileLength) ? String(fileLength) : "";
        } else if (typeof fileLength === "bigint") {
            declarado = fileLength.toString();
        } else if (typeof fileLength === "string") {
            declarado = fileLength;
        } else if (fileLength && typeof fileLength.toString === "function") {
            declarado = fileLength.toString();
        }
    } catch (_) {
        return false;
    }

    if (!declarado || !/^\d+$/.test(declarado)) {
        return false;
    }

    try {
        return BigInt(declarado) > BigInt(MAX_INPUT_BYTES);
    } catch (_) {
        return false;
    }
}

async function converterParaJpeg(buffer, header) {
    const decodeOptions = header.mime === "image/jpeg"
        ? { "image/jpeg": { maxResolutionInMP: 12 } }
        : undefined;
    const image = await Jimp.fromBuffer(buffer, decodeOptions);

    if (image.mime !== header.mime) {
        throw new Error("O formato decodificado não corresponde ao cabeçalho.");
    }

    validateDecodedDimensions(image);
    let output = image;

    if (header.mime === "image/png") {
        const fundoPreto = new Jimp({
            width: image.bitmap.width,
            height: image.bitmap.height,
            color: 0x000000ff
        });
        output = fundoPreto.composite(image, 0, 0);
    }

    const jpeg = await output.getBuffer("image/jpeg");
    if (
        !Buffer.isBuffer(jpeg) ||
        jpeg.length < 4 ||
        !jpeg.subarray(0, 2).equals(JPEG_START)
    ) {
        throw new Error("A conversão não produziu um JPEG válido.");
    }

    return jpeg;
}

function gravarAtomicamente(destino, dados) {
    const temporario = path.join(
        path.dirname(destino),
        `.${path.basename(destino)}.${process.pid}.${randomUUID()}.tmp`
    );

    let descritor;
    let temporarioCriado = false;
    try {
        descritor = fs.openSync(temporario, "wx");
        temporarioCriado = true;
        fs.writeFileSync(descritor, dados);
        fs.closeSync(descritor);
        descritor = undefined;
        fs.renameSync(temporario, destino);
        temporarioCriado = false;
    } catch (erroOriginal) {
        if (descritor !== undefined) {
            try { fs.closeSync(descritor); } catch (_) {}
        }
        if (temporarioCriado) {
            try { fs.unlinkSync(temporario); } catch (_) {}
        }
        throw erroOriginal;
    }
}

function obterImagem(ctx) {
    const mensagem = ctx.message?.message;
    const citada = mensagem?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMessage = mensagem?.imageMessage || citada?.imageMessage;

    if (!imageMessage) {
        throw new Error("MENU_IMAGE_MISSING");
    }

    return {
        message: {
            imageMessage
        },
        imageMessage
    };
}

async function salvarImagemMenu(ctx, destino, invalidarCache) {
    const origem = obterImagem(ctx);
    if (tamanhoDeclaradoExcedeLimite(origem.imageMessage.fileLength)) {
        throw new Error("A imagem excede o limite de 8 MB.");
    }

    const imagem = await downloadMediaMessage(
        origem,
        "buffer",
        {},
        { logger: console }
    );
    const header = inspectImageHeader(imagem);
    const jpeg = await converterParaJpeg(imagem, header);

    gravarAtomicamente(destino, jpeg);
    if (typeof invalidarCache === "function") {
        invalidarCache(destino);
    }

    return destino;
}

module.exports = {
    MAX_INPUT_BYTES,
    MAX_IMAGE_DIMENSION,
    MAX_IMAGE_PIXELS,
    obterImagem,
    inspectImageHeader,
    salvarImagemMenu,
    gravarAtomicamente
};
