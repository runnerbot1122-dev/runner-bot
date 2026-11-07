const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["noticias", "gnews"],
    description: "Mostra as últimas notícias do G1",
    execute: async (ctx) => {
        try { await ctx.react("📰"); } catch (e) {}

        try {
            // Usa o rss2json para converter o feed do G1 em JSON
            const res = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=https://g1.globo.com/rss/g1/`, { timeout: 10000 });
            
            if (res.data.status !== "ok") throw new Error("Falha no RSS");

            const noticias = res.data.items.slice(0, 5);
            
            let texto = `╔═━✰『 úʟᴛɪᴍᴀs ɴᴏᴛíᴄɪᴀs 』═━✰\n\n`;
            
            noticias.forEach((n, i) => {
                texto += `║╎⊹ ࣪ ˖ ${i + 1}º ▸ *${n.title}*\n`;
                texto += `║╎⊹ ࣪ ˖ 🔗 ▸ ${n.link}\n\n`;
            });

            texto += `╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");
        } catch (e) { await replyNYX(ctx, "❌ Erro ao buscar as notícias.", "bot"); }
    }
};