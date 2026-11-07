const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["letra", "letramusic"],
    description: "Busca a letra de uma música",
    execute: async (ctx) => {
        const busca = ctx.args.join(" ").trim();
        if (!busca) {
            return replyNYX(ctx, `🎵 *LETRA DE MÚSICA*\n\nUso: ${ctx.prefix}letra [nome da música]\nEx: ${ctx.prefix}letra tempo perdido`, "bot");
        }

        try { await ctx.react("🎵"); } catch (e) {}

        try {
            // A LRCLIB usa o parâmetro 'q' para a busca geral
            const url = `https://lrclib.net/api/search?q=${encodeURIComponent(busca)}`;
            
            // É recomendado identificar o cliente com um User-Agent[reference:3]
            const res = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'RunnerBot/1.0 (https://github.com/runnerbot1122-dev)'
                }
            });

            // A API retorna um array. Se estiver vazio, não encontrou.
            if (!res.data || res.data.length === 0) {
                return replyNYX(ctx, "❌ Não consegui encontrar essa música na base de dados. Tente ser mais específico (ex: artista - música).", "bot");
            }

            // Pega o primeiro resultado da lista
            const musicaInfo = res.data[0];
            const letra = musicaInfo.plainLyrics || musicaInfo.syncedLyrics;

            if (!letra) {
                return replyNYX(ctx, "❌ Encontrei a música, mas a letra não está disponível.", "bot");
            }

            const titulo = musicaInfo.trackName || busca;
            const artista = musicaInfo.artistName || "Desconhecido";

            // Corta se a letra for gigante
            const letraFinal = letra.length > 3500 ? letra.substring(0, 3500) + "\n\n[... letra cortada ...]" : letra;

            const texto = 
`╔═━✰『 ʟᴇᴛʀᴀ ᴅᴀ ᴍúsɪᴄᴀ 』═━✰

║╎⊹ ࣪ ˖ 🎤 ▸ *${artista.toUpperCase()}*
║╎⊹ ࣪ ˖ 🎵 ▸ *${titulo.toUpperCase()}*

${letraFinal}

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");

        } catch (error) {
            console.error("[LETRA] Erro:", error.message);
            await replyNYX(ctx, "❌ Erro ao buscar a letra. A API pode estar fora do ar. Tente novamente.", "bot");
        }
    }
};