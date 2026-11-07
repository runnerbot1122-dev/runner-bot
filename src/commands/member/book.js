const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["book", "livro"],
    description: "Busca informações de um livro",
    execute: async (ctx) => {
        const busca = ctx.args.join(" ").trim();
        if (!busca) return replyNYX(ctx, `📚 *LIVROS*\n\nUso: ${ctx.prefix}livro [nome]`, "bot");

        try { await ctx.react("📚"); } catch (e) {}

        try {
            const res = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(busca)}&limit=1`, { timeout: 10000 });
            
            if (!res.data || !res.data.docs || res.data.docs.length === 0) {
                return replyNYX(ctx, "❌ Livro não encontrado.", "bot");
            }

            const info = res.data.docs[0];
            const titulo = info.title;
            const autor = info.author_name ? info.author_name[0] : "Desconhecido";
            const ano = info.first_publish_year || "N/A";
            const paginas = info.number_of_pages_median || "N/A";

            const texto = 
`╔═━✰『 ɪɴғᴏ ʟɪᴠʀᴏ 』═━✰

║╎⊹ ࣪ ˖ 📚 ▸ *${titulo}*
║╎⊹ ࣪ ˖ ✍️ ▸ ᴀᴜᴛᴏʀ: *${autor}*
║╎⊹ ࣪ ˖ 📅 ▸ ᴘᴜʙʟɪᴄᴀᴅᴏ: *${ano}*
║╎⊹ ࣪ ˖ 📄 ▸ ᴘáɢɪɴᴀs: *${paginas}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");
        } catch (e) { await replyNYX(ctx, "❌ Erro ao buscar o livro.", "bot"); }
    }
};