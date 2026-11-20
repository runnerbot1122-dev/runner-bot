const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

const OMDB_URL = "https://www.omdbapi.com/";
const OMDB_KEY = "trilogy";

module.exports = {
    name: ["serie", "series"],
    description: "Pesquisa séries no IMDb",

    execute: async ctx => {
        const query = ctx.args.join(" ").trim();

        if (!query) {
            return replyNYX(
                ctx,
                `📺 *PESQUISA DE SÉRIES*\n\nUso: ${ctx.prefix}serie [nome da série]\nEx: ${ctx.prefix}serie Breaking Bad`,
                "bot"
            );
        }

        try {
            await ctx.react("📺");
        } catch (error) {}

        try {
            const response = await axios.get(OMDB_URL, {
                params: { s: query, type: "series", page: 1, apikey: OMDB_KEY },
                timeout: 15000
            });
            const data = response.data;

            if (data.Response === "False" || !Array.isArray(data.Search)) {
                return replyNYX(ctx, "❌ Nenhuma série encontrada.", "bot");
            }

            const resultados = data.Search.slice(0, 8);
            let texto = `╔═━✰『 sÉʀɪᴇs 』═━✰\n\n`;
            texto += `🔎 Resultados para: *${query}*\n\n`;

            resultados.forEach((item, index) => {
                texto += `${index + 1}. *${item.Title}* (${item.Year})\n`;
                texto += `   https://www.imdb.com/title/${item.imdbID}/\n\n`;
            });

            texto += "╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰";
            return replyNYX(ctx, texto, "bot");
        } catch (error) {
            console.error("[SERIE] Erro:", error.message);
            return replyNYX(ctx, "❌ Erro ao pesquisar séries. Tente novamente.", "bot");
        }
    }
};
