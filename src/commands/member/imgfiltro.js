const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");

function unwrapMessage(message) {
    let atual = message || {};
    for (let i = 0; i < 6; i++) {
        const interno = atual.ephemeralMessage?.message || atual.viewOnceMessage?.message ||
            atual.viewOnceMessageV2?.message || atual.viewOnceMessageV2Extension?.message ||
            atual.documentWithCaptionMessage?.message || atual.editedMessage?.message;
        if (!interno) break;
        atual = interno;
    }
    return atual;
}

function quotedOf(message) {
    const atual = unwrapMessage(message?.message);
    for (const valor of Object.values(atual)) {
        const citado = valor?.contextInfo?.quotedMessage;
        if (citado) return unwrapMessage(citado);
    }
    return null;
}

function stickerOf(message) {
    const atual = unwrapMessage(message);
    return atual.stickerMessage || atual.audioStickerMessage?.message?.stickerMessage || null;
}

module.exports = {
    name: ["imgfiltro", "filtro"],
    description: "Aplica filtros em imagens ou figurinhas",
    execute: async (ctx) => {
        const quoted = quotedOf(ctx.message);
        const sticker = stickerOf(quoted);

        // Verifica se respondeu a uma imagem ou figurinha (com ou sem som)
        if (!quoted || (!quoted.imageMessage && !sticker)) {
            return replyNYX(ctx, `ð¼ï¸ *FILTROS DE IMAGEM*\n\nResponda a uma *foto* ou *figurinha* com:\n*${ctx.prefix}imgfiltro <nome>*\n\nFiltros: cartoon, blur, pixelate, glow, pb, inverter, espelho`, "bot");
        }

        const tipo = ctx.args[0]?.toLowerCase();
        const filtrosDisponiveis = ["cartoon", "blur", "pixelate", "glow", "pb", "inverter", "espelho"];
        
        if (!tipo || !filtrosDisponiveis.includes(tipo)) {
            return replyNYX(ctx, `â Filtro invÃ¡lido ou nÃ£o informado.\n\nEscolha um: ${filtrosDisponiveis.join(", ")}`, "bot");
        }

        try { await ctx.react("ð¨"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "filtro-"));
        const inputFile = path.join(temp, "input.img");
        const outputFile = path.join(temp, "output.jpg");

        try {
            // Baixa a imagem ou o WebP interno de uma figurinha com/sem som.
            let buffer;
            let clip = null;
            if (sticker) {
                const kit = await getSoundStickerKit();
                buffer = await kit.downloadMedia(sticker, "sticker");
                clip = await kit.getStickerSound(sticker);
            } else {
                const quotedMsg = {
                    key: {
                        remoteJid: ctx.chat,
                        id: ctx.message.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: ctx.message.message.extendedTextMessage.contextInfo.participant
                    },
                    message: quoted
                };
                buffer = await downloadMediaMessage(
                    quotedMsg, "buffer", {},
                    { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
                );
            }

            fs.writeFileSync(inputFile, buffer);

            // Inicializa o Sharp
            let image = sharp(inputFile);
            const metadata = await image.metadata();
            let width = metadata.width || 512;
            let height = metadata.height || 512;

            // Aplica o filtro escolhido
            switch (tipo) {
                case "blur":
                    image = image.blur(15);
                    break;
                case "pixelate":
                    // Reduz drasticamente e depois aumenta com nearest neighbor para ficar quadrado
                    const pixelSize = 20;
                    const smallW = Math.max(1, Math.floor(width / pixelSize));
                    const smallH = Math.max(1, Math.floor(height / pixelSize));
                    image = image.resize(smallW, smallH, { kernel: 'nearest' }).resize(width, height, { kernel: 'nearest' });
                    break;
                case "cartoon":
                    // Efeito de desenho: remove ruÃ­do, aumenta contraste e nitidez
                    image = image.median(5).normalize().sharpen();
                    break;
                case "pb":
                    image = image.grayscale();
                    break;
                case "inverter":
                    image = image.negate();
                    break;
                case "espelho":
                    image = image.flop();
                    break;
                case "glow":
                    // Efeito Glow: Cria uma versÃ£o desfocada e mistura com a original usando 'screen'
                    const blurredBuffer = await image.clone().blur(20).toBuffer();
                    image = image.composite([{ input: blurredBuffer, blend: 'screen' }]);
                    break;
            }

            // Converte para JPEG (garante compatibilidade com o WhatsApp)
            await image.jpeg({ quality: 90 }).toFile(outputFile);

            // Envia a imagem processada
            await sendNYXMedia(ctx.sock, ctx.chat, { 
                image: fs.readFileSync(outputFile),
                caption: `â¨ Filtro aplicado: *${tipo}*`
            }, ctx.message);

            if (clip) await replyNYX(ctx, "â¹ï¸ A imagem com filtro nÃ£o preserva o Ã¡udio da figurinha.", "bot");

        } catch (error) {
            console.error("[IMGFILTRO] Erro:", error.message);
            await replyNYX(ctx, "â Erro ao processar a imagem. Verifique se a mÃ­dia Ã© vÃ¡lida.", "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};
