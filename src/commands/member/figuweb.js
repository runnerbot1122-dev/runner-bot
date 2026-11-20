const axios = require("axios");
const sharp = require("sharp");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
        return false;
    }
}

module.exports = {
    name: ["figuweb"],
    description: "Cria uma figurinha a partir de uma imagem da web",

    execute: async ctx => {
        const url = ctx.args[0];

        if (!url || !isHttpUrl(url)) {
            return replyNYX(
                ctx,
                `🌐 Envie uma URL direta de imagem.\n\nUso: ${ctx.prefix}figuweb https://site.com/imagem.jpg`,
                "bot"
            );
        }

        try {
            await ctx.react("🌐");
            await ctx.reply("🌐 Baixando a imagem, aguarde...");

            const response = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 30000,
                maxContentLength: 10 * 1024 * 1024,
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            const contentType = String(response.headers["content-type"] || "");
            if (!contentType.startsWith("image/")) {
                return replyNYX(ctx, "❌ A URL não aponta para uma imagem válida.", "bot");
            }

            const sticker = await sharp(Buffer.from(response.data))
                .resize(512, 512, {
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 80 })
                .toBuffer();

            return sendNYXMedia(ctx.sock, ctx.chat, { sticker }, ctx.message);
        } catch (error) {
            console.error("[FIGUWEB] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui baixar ou converter essa imagem.", "bot");
        }
    }
};