const axios = require("axios");
const sharp = require("sharp");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

function getTarget(ctx) {
    const mentioned = ctx.message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    return mentioned[0] || ctx.sender;
}

module.exports = {
    name: ["figperfil"],
    description: "Transforma a foto de perfil em figurinha",

    execute: async ctx => {
        const target = getTarget(ctx);
        const number = target.split("@")[0];

        try {
            await ctx.react("👤");
            const pictureUrl = await ctx.sock.profilePictureUrl(target, "image");
            const response = await axios.get(pictureUrl, {
                responseType: "arraybuffer",
                timeout: 30000,
                maxContentLength: 10 * 1024 * 1024
            });

            const sticker = await sharp(Buffer.from(response.data))
                .resize(512, 512, {
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 80 })
                .toBuffer();

            return sendNYXMedia(
                ctx.sock,
                ctx.chat,
                { sticker },
                ctx.message
            );
        } catch (error) {
            console.error("[FIGPERFIL] Erro:", error.message);
            return replyNYX(
                ctx,
                `❌ Não consegui obter a foto de perfil de @${number}. A pessoa pode estar sem foto ou ter bloqueado a visualização.`,
                "bot"
            );
        }
    }
};
