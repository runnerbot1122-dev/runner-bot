const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

const OMDB_URL = "https://www.omdbapi.com/";
const OMDB_KEY = "trilogy";

async function omdb(params) {
    const response = await axios.get(OMDB_URL, {
        params: { ...params, apikey: OMDB_KEY },
        timeout: 15000
    });
    return response.data;
}

module.exports = {
    name: ["imdb"],
    description: "Pesquisa filmes e títulos no IMDb",

    execute: async ctx => {
        const query = ctx.args.join(" ").trim();

        if (!query) {
            return replyNYX(
                ctx,
                `🎬 *PESQUISA IMDb*\n\nUso: ${ctx.prefix}imdb [nome do filme]\nEx: ${ctx.prefix}imdb Interestelar`,
                "bot"
            );
        }

        try {
            await ctx.react("🎬");
        } catch (error) {}

        try {
            const data = await omdb({ s: query, page: 1 });
            if (data.Response === "False" || !Array.isArray(data.Search)) {
                return replyNYX(ctx, "❌ Nenhum título encontrado no IMDb.", "bot");
            }

            const resultados = data.Search.slice(0, 8);
            let texto = `╔═━✰『 ᴘᴇsǫᴜɪsᴀ ɪᴍᴅʙ 』═━✰\n\n`;
            texto += `🔎 Resultados para: *${query}*\n\n`;

            resultados.forEach((item, index) => {
                const tipo = item.Type === "series" ? "série" : "filme";
                texto += `${index + 1}. *${item.Title}* (${item.Year})\n`;
                texto += `   ${tipo} • https://www.imdb.com/title/${item.imdbID}/\n\n`;
            });

            texto += "╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰";
            return replyNYX(ctx, texto, "bot");
        } catch (error) {
            console.error("[IMDB] Erro:", error.message);
            return replyNYX(ctx, "❌ Erro ao pesquisar no IMDb. Tente novamente.", "bot");
        }
    }
};

module.exports.omdb = omdb;