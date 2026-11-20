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

function valueOrFallback(value, fallback = "Não informado") {
    return value && value !== "N/A" ? value : fallback;
}

module.exports = {
    name: ["imdbinfo"],
    description: "Mostra detalhes de um título do IMDb",

    execute: async ctx => {
        const query = ctx.args.join(" ").trim();

        if (!query) {
            return replyNYX(
                ctx,
                `🎬 *INFORMAÇÕES IMDb*\n\nUso: ${ctx.prefix}imdbinfo [nome ou ID]\nEx: ${ctx.prefix}imdbinfo tt0816692`,
                "bot"
            );
        }

        try {
            await ctx.react("🎬");
        } catch (error) {}

        try {
            let data;
            if (/^tt\d+$/i.test(query)) {
                data = await omdb({ i: query });
            } else {
                const busca = await omdb({ s: query, page: 1 });
                if (busca.Response === "False" || !busca.Search?.length) {
                    return replyNYX(ctx, "❌ Nenhum título encontrado no IMDb.", "bot");
                }
                data = await omdb({ i: busca.Search[0].imdbID, plot: "short" });
            }

            if (data.Response === "False") {
                return replyNYX(ctx, "❌ Não encontrei informações para esse título.", "bot");
            }

            const tipo = data.Type === "series" ? "Série" : data.Type === "episode" ? "Episódio" : "Filme";
            const nota = data.imdbRating !== "N/A" ? `${data.imdbRating}/10` : "Sem nota";
            const sinopse = valueOrFallback(data.Plot, "Sinopse não disponível.");
            const texto =
`╔═━✰『 ɪɴғᴏ ɪᴍᴅʙ 』═━✰

🎬 *${valueOrFallback(data.Title)}*

📌 Tipo: *${tipo}*
📅 Ano: *${valueOrFallback(data.Year)}*
⭐ Nota IMDb: *${nota}*
🎭 Gênero: *${valueOrFallback(data.Genre)}*
⏱️ Duração: *${valueOrFallback(data.Runtime)}*
🎥 Direção: *${valueOrFallback(data.Director)}*
🎭 Elenco: *${valueOrFallback(data.Actors)}*

📝 *Sinopse*
${sinopse}

🔗 https://www.imdb.com/title/${data.imdbID}/

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            return replyNYX(ctx, texto, "bot");
        } catch (error) {
            console.error("[IMDBINFO] Erro:", error.message);
            return replyNYX(ctx, "❌ Erro ao buscar as informações no IMDb.", "bot");
        }
    }
};
