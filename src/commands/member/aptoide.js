const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["aptoide"],
    description: "Busca aplicativos na Aptoide",

    execute: async ctx => {
        const query = ctx.args.join(" ").trim();

        if (!query) {
            return replyNYX(
                ctx,
                `📱 *APTOIDE*\n\nUso: ${ctx.prefix}aptoide [nome do aplicativo]\nEx: ${ctx.prefix}aptoide WhatsApp`,
                "bot"
            );
        }

        try {
            await ctx.react("📱");
        } catch (error) {}

        try {
            const response = await axios.get("https://ws75.aptoide.com/api/7/apps/search", {
                params: { query, limit: 6 },
                headers: { "User-Agent": "Mozilla/5.0" },
                timeout: 15000
            });

            const resultados = response.data?.datalist?.list;
            if (!Array.isArray(resultados) || resultados.length === 0) {
                return replyNYX(ctx, "❌ Nenhum aplicativo encontrado na Aptoide.", "bot");
            }

            let texto = `╔═━✰『 ᴀᴘᴛᴏɪᴅᴇ 』═━✰\n\n`;
            texto += `🔎 Resultados para: *${query}*\n\n`;

            resultados.forEach((app, index) => {
                const versao = app.file?.vername || "não informada";
                const tamanho = app.file?.filesize || app.size;
                const tamanhoMb = tamanho ? `${(Number(tamanho) / 1024 / 1024).toFixed(1)} MB` : "não informado";
                const link = app.file?.path || app.file?.path_alt || "sem link direto";

                texto += `${index + 1}. *${app.name || "Aplicativo"}*\n`;
                texto += `   Desenvolvedor: ${app.developer?.name || app.developer || "não informado"}\n`;
                texto += `   Versão: ${versao} • Tamanho: ${tamanhoMb}\n`;
                texto += `   ${link}\n\n`;
            });

            texto += "⚠️ Instale apenas aplicativos de fontes confiáveis.\n\n";
            texto += "╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰";
            return replyNYX(ctx, texto, "bot");
        } catch (error) {
            console.error("[APTOIDE] Erro:", error.message);
            return replyNYX(ctx, "❌ Erro ao pesquisar aplicativos na Aptoide.", "bot");
        }
    }
};