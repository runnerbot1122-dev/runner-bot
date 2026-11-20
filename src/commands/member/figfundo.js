const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const REMOVE_BG_API_KEY = "mGP9kKxSznHwhsn8vzeM4er5"; 

module.exports = {
    name: ["figfundo", "removebg", "figusemfundo"],
    description: "Remove o fundo de uma imagem e cria uma figurinha",
    execute: async (ctx) => {
        const quoted = ctx.message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !quoted.imageMessage) {
            return replyNYX(ctx, `🖼️ *REMOVER FUNDO*\n\nResponda a uma *foto* com *${ctx.prefix}figfundo*!`, "bot");
        }

        try { await ctx.react("✂️"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "removebg-"));
        const inputFile = path.join(temp, "input.jpg");
        const outputPng = path.join(temp, "no-bg.png");
        const outputWebp = path.join(temp, "figurinha.webp");

        try {
            const buffer = await downloadMediaMessage(
                { key: { remoteJid: ctx.chat, id: ctx.message.message.extendedTextMessage.contextInfo.stanzaId, participant: ctx.message.message.extendedTextMessage.contextInfo.participant }, message: quoted },
                "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
            );
            fs.writeFileSync(inputFile, buffer);

            await replyNYX(ctx, "✂️ Removendo o fundo, aguarde...", "bot");

            const formData = new FormData();
            formData.append("image_file", fs.createReadStream(inputFile));
            formData.append("size", "auto");

            const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
                headers: { ...formData.getHeaders(), "X-Api-Key": REMOVE_BG_API_KEY },
                responseType: "arraybuffer"
            });

            fs.writeFileSync(outputPng, response.data);

            await sharp(outputPng)
                .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp({ quality: 80, lossless: true })
                .toFile(outputWebp);

            await sendNYXMedia(ctx.sock, ctx.chat, { sticker: fs.readFileSync(outputWebp) }, ctx.message);

        } catch (error) {
            console.error("[FIGFUNDO] Erro:", error.message);
            await replyNYX(ctx, "❌ Erro ao processar a imagem. Verifique a chave da API.", "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};
