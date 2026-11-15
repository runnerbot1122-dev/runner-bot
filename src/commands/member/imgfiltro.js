const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: ["imgfiltro", "filtro"],
    description: "Aplica filtros em imagens ou figurinhas",
    execute: async (ctx) => {
        const quoted = ctx.message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Verifica se respondeu a uma imagem ou figurinha
        if (!quoted || (!quoted.imageMessage && !quoted.stickerMessage)) {
            return replyNYX(ctx, `🖼️ *FILTROS DE IMAGEM*\n\nResponda a uma *foto* ou *figurinha* com:\n*${ctx.prefix}imgfiltro <nome>*\n\nFiltros: cartoon, blur, pixelate, glow, pb, inverter, espelho`, "bot");
        }

        const tipo = ctx.args[0]?.toLowerCase();
        const filtrosDisponiveis = ["cartoon", "blur", "pixelate", "glow", "pb", "inverter", "espelho"];
        
        if (!tipo || !filtrosDisponiveis.includes(tipo)) {
            return replyNYX(ctx, `❌ Filtro inválido ou não informado.\n\nEscolha um: ${filtrosDisponiveis.join(", ")}`, "bot");
        }

        try { await ctx.react("🎨"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "filtro-"));
        const inputFile = path.join(temp, "input.img");
        const outputFile = path.join(temp, "output.jpg");

        try {
            // Prepara o objeto para download
            const quotedMsg = {
                key: {
                    remoteJid: ctx.chat,
                    id: ctx.message.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: ctx.message.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };

            // Baixa a imagem ou figurinha
            const buffer = await downloadMediaMessage(
                quotedMsg, "buffer", {},
                { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
            );

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
                    // Efeito de desenho: remove ruído, aumenta contraste e nitidez
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
                    // Efeito Glow: Cria uma versão desfocada e mistura com a original usando 'screen'
                    const blurredBuffer = await image.clone().blur(20).toBuffer();
                    image = image.composite([{ input: blurredBuffer, blend: 'screen' }]);
                    break;
            }

            // Converte para JPEG (garante compatibilidade com o WhatsApp)
            await image.jpeg({ quality: 90 }).toFile(outputFile);

            // Envia a imagem processada
            await sendNYXMedia(ctx.sock, ctx.chat, { 
                image: fs.readFileSync(outputFile),
                caption: `✨ Filtro aplicado: *${tipo}*`
            }, ctx.message);

        } catch (error) {
            console.error("[IMGFILTRO] Erro:", error.message);
            await replyNYX(ctx, "❌ Erro ao processar a imagem. Verifique se a mídia é válida.", "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};