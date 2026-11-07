const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["movie", "filme"],
    description: "Busca informações de um filme",
    execute: async (ctx) => {
        const busca = ctx.args.join(" ").trim();
        if (!busca) return replyNYX(ctx, `🎬 *FILMES*\n\nUso: ${ctx.prefix}filme [nome]\nEx: ${ctx.prefix}filme Spider Man`, "bot");

        try { await ctx.react("🎬"); } catch (e) {}

        try {
            // 1. Busca apenas do tipo "movie" (filme) para evitar documentários e séries
            const buscaRes = await axios.get(`https://www.omdbapi.com/?s=${encodeURIComponent(busca)}&type=movie&apikey=trilogy`, { timeout: 10000 });
            
            if (buscaRes.data.Response === "False" || !buscaRes.data.Search) {
                return replyNYX(ctx, "❌ Filme não encontrado. Tente digitar o nome em inglês (ex: Spider Man) ou o nome completo.", "bot");
            }

            // Pega o filme mais recente da lista (que geralmente é o mais popular)
            const filmes = buscaRes.data.Search.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
            const filmeId = filmes[0].imdbID;
            
            // 2. Pega os detalhes completos do filme escolhido
            const res = await axios.get(`https://www.omdbapi.com/?i=${filmeId}&apikey=trilogy`, { timeout: 10000 });
            const data = res.data;

            // Formata as informações
            const nota = data.imdbRating !== "N/A" ? `${data.imdbRating}/10` : "Sem nota";
            const duracao = data.Runtime !== "N/A" ? data.Runtime : "Não informada";
            const genero = data.Genre !== "N/A" ? data.Genre : "Não informado";
            const sinopse = data.Plot !== "N/A" ? data.Plot.substring(0, 300) + "..." : "Sem sinopse disponível.";

            const texto = 
`╔═━✰『 ɪɴғᴏ ғɪʟᴍᴇ 』═━✰

║╎⊹ ࣪ ˖ 🎬 ▸ *${data.Title}*
║╎⊹ ࣪ ˖ 📅 ▸ ᴀɴᴏ: *${data.Year}*
║╎⊹ ࣪ ˖ ⭐ ▸ ɴᴏᴛᴀ: *${nota}*
║╎⊹ ࣪ ˖ 🎭 ▸ ɢêɴᴇʀᴏ: *${genero}*
║╎⊹ ࣪ ˖ ⏱️ ▸ ᴅᴜʀᴀçãᴏ: *${duracao}*
║╎⊹ ࣪ ˖ 📝 ▸ sɪɴᴏᴘsᴇ:
_${sinopse}_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");
        } catch (e) {
            console.error("[FILME] Erro:", e.message);
            await replyNYX(ctx, "❌ Erro ao buscar o filme.", "bot");
        }
    }
};