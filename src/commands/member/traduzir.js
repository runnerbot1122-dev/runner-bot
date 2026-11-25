const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

function textoCitado(ctx) {
    const citado = ctx.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    return citado?.conversation || citado?.extendedTextMessage?.text || "";
}

function idiomaValido(valor) {
    return /^[a-z]{2,3}(?:-[a-z]{2,4})?$/i.test(valor || "");
}

module.exports = {
    name: ["traduzir"],
    description: "Traduz um texto para outro idioma",
    execute: async (ctx) => {
        const args = [...(ctx.args || [])];
        let destino = "pt";

        if (args[0] && idiomaValido(args[0])) {
            destino = args.shift().toLowerCase();
        }

        const texto = args.join(" ").trim() || textoCitado(ctx);

        if (!texto) {
            return replyNYX(ctx, `🌐 *TRADUZIR*\n\nUso: *${ctx.prefix}traduzir <idioma> <texto>*\nExemplo: *${ctx.prefix}traduzir en Olá, tudo bem?*\n\nVocê também pode responder a uma mensagem.`, "bot");
        }

        if (texto.length > 4500) {
            return replyNYX(ctx, "❌ O texto deve ter no máximo 4500 caracteres.", "bot");
        }

        try { await ctx.react("🌐"); } catch (e) {}

        try {
            const resposta = await axios.get("https://translate.googleapis.com/translate_a/single", {
                params: {
                    client: "gtx",
                    sl: "auto",
                    tl: destino,
                    dt: "t",
                    q: texto
                },
                timeout: 15000
            });

            const partes = Array.isArray(resposta.data?.[0]) ? resposta.data[0] : [];
            const traducao = partes.map(parte => parte?.[0] || "").join("").trim();

            if (!traducao) throw new Error("Resposta de tradução vazia");

            await replyNYX(ctx,
`╔═━✰『 ᴛʀᴀᴅᴜçãᴏ 』═━✰

║╎⊹ ࣪ ˖ 🌐 ▸ ɪᴅɪᴏᴍᴀ: *${destino}*
║╎⊹ ࣪ ˖ 📝 ▸ ${traducao}

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
        } catch (error) {
            console.error("[TRADUZIR] Erro:", error.response?.data || error.message);
            await replyNYX(ctx, "❌ Não consegui traduzir esse texto agora.", "bot");
        }
    }
};