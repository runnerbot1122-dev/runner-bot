const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

module.exports = {
    name: ["gtts"],
    description: "Converte texto em áudio",
    execute: async (ctx) => {
        const args = [...(ctx.args || [])];
        let idioma = "pt";

        if (args[0] && /^[a-z]{2}(?:-[A-Z]{2})?$/i.test(args[0]) && args.length > 1) {
            idioma = args.shift().toLowerCase();
        }

        const texto = args.join(" ").trim();

        if (!texto) {
            return replyNYX(ctx, `🔊 *GTTS*\n\nUso: *${ctx.prefix}gtts <texto>*\nExemplo: *${ctx.prefix}gtts Olá, seja bem-vindo!*\n\nPara escolher o idioma: *${ctx.prefix}gtts en Hello everyone*`, "bot");
        }

        if (texto.length > 200) {
            return replyNYX(ctx, "❌ O texto deve ter no máximo 200 caracteres para gerar o áudio.", "bot");
        }

        try { await ctx.react("🔊"); } catch (e) {}

        try {
            const resposta = await axios.get("https://translate.google.com/translate_tts", {
                params: {
                    ie: "UTF-8",
                    client: "tw-ob",
                    tl: idioma,
                    q: texto
                },
                responseType: "arraybuffer",
                timeout: 20000,
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            const audio = Buffer.from(resposta.data);
            if (!audio.length) throw new Error("Áudio vazio");

            await sendNYXMedia(ctx.sock, ctx.chat, {
                audio,
                mimetype: "audio/mpeg",
                ptt: true
            }, ctx.message);
        } catch (error) {
            console.error("[GTTS] Erro:", error.response?.status || error.message);
            await replyNYX(ctx, "❌ Não consegui gerar o áudio. Verifique o texto e tente novamente.", "bot");
        }
    }
};