const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { renderTextSticker } = require("../../utils/textSticker");

module.exports = {
    name: ["ttps"],
    description: "Cria uma figurinha a partir de texto",

    execute: async ctx => {
        const texto = ctx.args.join(" ").trim();
        if (!texto) {
            return replyNYX(ctx, `✍️ Envie um texto.\n\nUso: ${ctx.prefix}ttps [texto]`, "bot");
        }

        try {
            await ctx.react("✍️");
            const sticker = await renderTextSticker(texto, {
                background: "#dbeafe",
                color: "#111827",
                fontSize: 40,
                maxChars: 20
            });

            return sendNYXMedia(ctx.sock, ctx.chat, { sticker }, ctx.message);
        } catch (error) {
            console.error("[TTPS] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui criar a figurinha de texto.", "bot");
        }
    }
};
