const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

const IDIOMAS = {
    portugues: "pt",
    português: "pt",
    ingles: "en",
    inglês: "en",
    espanhol: "es",
    frances: "fr",
    francês: "fr",
    alemao: "de",
    alemão: "de",
    italiano: "it",
    japones: "ja",
    japonês: "ja",
    coreano: "ko",
    russo: "ru",
    arabe: "ar",
    árabe: "ar",
    chines: "zh-CN",
    chinês: "zh-CN"
};

function desembrulharMensagem(mensagem) {
    let atual = mensagem || {};
    const wrappers = [
        "ephemeralMessage",
        "viewOnceMessage",
        "viewOnceMessageV2",
        "viewOnceMessageV2Extension",
        "documentWithCaptionMessage"
    ];

    for (let i = 0; i < 3; i += 1) {
        const wrapper = wrappers.find((nome) => atual?.[nome]?.message);
        if (!wrapper) break;
        atual = atual[wrapper].message;
    }

    return atual;
}

function textoDaMensagem(mensagem) {
    const atual = desembrulharMensagem(mensagem);
    return String(
        atual?.conversation ||
        atual?.extendedTextMessage?.text ||
        atual?.imageMessage?.caption ||
        atual?.videoMessage?.caption ||
        atual?.documentMessage?.caption ||
        atual?.audioMessage?.caption ||
        ""
    ).trim();
}

function textoCitado(ctx) {
    const contexto = ctx.message?.message?.extendedTextMessage?.contextInfo;
    return textoDaMensagem(contexto?.quotedMessage);
}

function normalizarIdioma(valor) {
    const chave = String(valor || "").trim().toLowerCase();
    if (IDIOMAS[chave]) return IDIOMAS[chave];
    if (/^[a-z]{2,3}(?:-[a-z]{2,4})?$/i.test(chave)) return chave;
    return null;
}

function obterDestino(args) {
    const possivelDestino = normalizarIdioma(args[0]);
    if (!possivelDestino) return { destino: "pt", texto: args.join(" ").trim() };
    return { destino: possivelDestino, texto: args.slice(1).join(" ").trim() };
}

function extrairTraducao(dados) {
    const partes = Array.isArray(dados?.[0]) ? dados[0] : [];
    return partes.map((parte) => parte?.[0] || "").join("").trim();
}

module.exports = {
    name: ["traduzir"],
    description: "Traduz um texto para outro idioma",
    execute: async (ctx) => {
        const args = [...(ctx.args || [])];
        const { destino, texto: textoDosArgumentos } = obterDestino(args);
        const texto = textoDosArgumentos || textoCitado(ctx);

        if (!texto) {
            return replyNYX(
                ctx,
                `🌐 *TRADUZIR*\n\nUso: *${ctx.prefix}traduzir <idioma> <texto>*\nExemplo: *${ctx.prefix}traduzir inglês Olá, tudo bem?*\n\nTambém é possível responder a um texto, legenda ou documento.`,
                "bot"
            );
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
                timeout: 20000
            });

            const traducao = extrairTraducao(resposta.data);
            if (!traducao) throw new Error("Resposta de tradução vazia");

            const origem = String(resposta.data?.[2] || "auto").toLowerCase();
            await replyNYX(
                ctx,
                `╔═━✰『 ᴛʀᴀᴅᴜçãᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🌐 ▸ ᴏʀɪɢᴇᴍ: *${origem}*\n║╎⊹ ࣪ ˖ 🎯 ▸ ᴅᴇsᴛɪɴᴏ: *${destino}*\n║╎⊹ ࣪ ˖ 📝 ▸ ${traducao}\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`,
                "bot"
            );
        } catch (error) {
            console.error("[TRADUZIR] Erro:", error.response?.data || error.message);
            try { await ctx.react("❌"); } catch (e) {}
            await replyNYX(ctx, "❌ Não consegui traduzir esse texto agora. Tente novamente em alguns instantes.", "bot");
        }
    }
};
