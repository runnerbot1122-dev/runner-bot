const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp"); // Importando o Sharp para converter a figurinha corretamente
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const REMOVE_BG_API_KEY = "mGP9kKxSznHwhsn8vzeM4er5"; // Certifique-se de que está com a sua chave

module.exports = {
    name: ["figfundo", "figusemfundo", "removebg"],
    description: "Remove o fundo de uma imagem e cria uma figurinha",
    execute: async (ctx) => {
        const quoted = ctx.message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted || !quoted.imageMessage) {
            return replyNYX(ctx, `🖼️ *REMOVER FUNDO*\n\nResponda a uma *foto* com *${ctx.prefix}figfundo* para eu remover o fundo e transformar em figurinha!`, "bot");
        }

        try { await ctx.react("✂️"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "removebg-"));
        const inputFile = path.join(temp, "input.jpg");
        const outputPng = path.join(temp, "no-bg.png");
        const outputWebp = path.join(temp, "figurinha.webp");

        try {
            const quotedMsg = {
                key: {
                    remoteJid: ctx.chat,
                    id: ctx.message.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: ctx.message.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };

            const buffer = await downloadMediaMessage(quotedMsg, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
            fs.writeFileSync(inputFile, buffer);

            await replyNYX(ctx, "✂️ Removendo o fundo, aguarde...", "bot");

            const formData = new FormData();
            formData.append("image_file", fs.createReadStream(inputFile));
            formData.append("size", "auto");

            const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
                headers: { ...formData.getHeaders(), "X-Api-Key": REMOVE_BG_API_KEY },
                responseType: "arraybuffer"
            });

            // Salva o PNG transparente retornado pela API
            fs.writeFileSync(outputPng, response.data);

            // Usa o Sharp para converter para WebP (garantindo a transparência e tamanho 512x512)
            await sharp(outputPng)
                .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp({ quality: 80, lossless: true }) // lossless: true mantém a transparência perfeita
                .toFile(outputWebp);

            // Envia a figurinha convertida
            await sendNYXMedia(ctx.sock, ctx.chat, { 
                sticker: fs.readFileSync(outputWebp) 
            }, ctx.message);

        } catch (error) {
            console.error("[FIGFUNDO] Erro detalhado:", error.response?.data || error.message);
            if (error.response?.status === 402) {
                await replyNYX(ctx, "❌ Sua cota de imagens gratuitas na API do remove.bg acabou.", "bot");
            } else if (error.response?.status === 401) {
                await replyNYX(ctx, "❌ Chave da API do remove.bg inválida. Verifique no código.", "bot");
            } else {
                await replyNYX(ctx, "❌ Erro ao remover o fundo ou converter a figurinha.", "bot");
            }
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};