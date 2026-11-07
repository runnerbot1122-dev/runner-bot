const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["wiki", "wikipedia"],
    description: "Busca um resumo na Wikipedia",
    execute: async (ctx) => {
        const busca = ctx.args.join(" ").trim();
        if (!busca) return replyNYX(ctx, `📖 *WIKIPEDIA*\n\nUso: ${ctx.prefix}wiki [termo]`, "bot");

        try { await ctx.react("📖"); } catch (e) {}

        try {
            // A Wikipedia exige um User-Agent pra liberar requisições de IPs desconhecidos
            const res = await axios.get(`https://pt.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&format=json&titles=${encodeURIComponent(busca)}`, { 
                timeout: 10000,
                headers: { "User-Agent": "RunnerBot/1.0 (https://github.com/runnerbot1122-dev)" }
            });
            
            const pages = res.data.query.pages;
            const pageId = Object.keys(pages)[0];

            if (pageId === "-1") {
                return replyNYX(ctx, "❌ Artigo não encontrado na Wikipedia.", "bot");
            }

            const info = pages[pageId];
            const resumo = info.extract ? info.extract.substring(0, 1000) + (info.extract.length > 1000 ? "..." : "") : "Sem resumo.";

            const texto = 
`╔═━✰『 ᴡɪᴋɪᴘᴇᴅɪᴀ 』═━✰

║╎⊹ ࣪ ˖ 📖 ▸ *${info.title}*
║╎⊹ ࣪ ˖ 📝 ▸ ʀᴇsᴜᴍᴏ:
_${resumo}_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");
        } catch (e) { await replyNYX(ctx, "❌ Erro ao buscar na Wikipedia.", "bot"); }
    }
};