const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

function getTarget(ctx) {
    const mentioned = ctx.message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    return mentioned[0] || ctx.sender;
}

module.exports = {
    name: ["getperfil"],
    description: "Busca a foto de perfil de um usuário",

    execute: async ctx => {
        const target = getTarget(ctx);
        const number = String(target || "").split("@")[0];

        try {
            await ctx.react("🖼️");
            const profileUrl = await ctx.sock.profilePictureUrl(target, "image");
            const response = await axios.get(profileUrl, {
                responseType: "arraybuffer",
                timeout: 30000,
                maxContentLength: 10 * 1024 * 1024,
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            return sendNYXMedia(ctx.sock, ctx.chat, {
                image: Buffer.from(response.data),
                caption: `🖼️ Foto de perfil de @${number}`,
                mentions: [target]
            }, ctx.message);
        } catch (error) {
            console.error("[GETPERFIL] Erro:", error.message);
            return replyNYX(
                ctx,
                `❌ Não consegui obter a foto de perfil de @${number}. A foto pode estar oculta ou indisponível.`,
                "bot"
            );
        }
    }
};
