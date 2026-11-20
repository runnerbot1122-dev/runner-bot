const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { renderTextSticker } = require("../../utils/textSticker");

function getQuoted(ctx) {
    const info = ctx.message.message?.extendedTextMessage?.contextInfo;
    return {
        message: info?.quotedMessage,
        participant: info?.participant || ""
    };
}

function getQuotedText(message) {
    if (!message) return "";
    return message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        message.documentMessage?.caption ||
        "Mensagem citada sem texto";
}

module.exports = {
    name: ["qc"],
    description: "Cria uma figurinha com uma mensagem citada",

    execute: async ctx => {
        const quoted = getQuoted(ctx);
        if (!quoted.message) {
            return replyNYX(ctx, `💬 Responda a uma mensagem com ${ctx.prefix}qc.`, "bot");
        }

        const texto = getQuotedText(quoted.message);
        const autor = quoted.participant ? `@${quoted.participant.split("@")[0]}` : "Mensagem citada";

        try {
            await ctx.react("💬");
            const sticker = await renderTextSticker(texto, {
                background: "#fef3c7",
                color: "#1f2937",
                fontSize: 36,
                maxChars: 20,
                maxLines: 10,
                startY: 180
            });

            return sendNYXMedia(ctx.sock, ctx.chat, { sticker }, ctx.message);
        } catch (error) {
            console.error("[QC] Erro:", error.message);
            return replyNYX(ctx, `❌ Não consegui criar a figurinha da mensagem de ${autor}.`, "bot");
        }
    }
};