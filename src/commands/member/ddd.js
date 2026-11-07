const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["ddd"],
    description: "Busca o estado e cidades de um DDD",
    execute: async (ctx) => {
        const ddd = ctx.args[0];
        if (!ddd || ddd.length !== 2) {
            return replyNYX(ctx, `📞 *CONSULTAR DDD*\n\nUso: ${ctx.prefix}ddd 11`, "bot");
        }

        try { await ctx.react("📞"); } catch (e) {}

        try {
            const res = await axios.get(`https://brasilapi.com.br/api/ddd/v1/${ddd}`, { timeout: 8000 });
            const data = res.data;

            if (!data.state) {
                return replyNYX(ctx, "❌ DDD não encontrado.", "bot");
            }

            // Pega as 10 primeiras cidades pra não ficar um texto gigante
            const cidades = data.cities.slice(0, 10).join(", ");
            const totalCidades = data.cities.length;

            const texto = 
`╔═━✰『 ᴄᴏɴsᴜʟᴛᴀ ᴅᴅᴅ 』═━✰

║╎⊹ ࣪ ˖ 📞 ▸ ᴅᴅᴅ: *${ddd}*
║╎⊹ ࣪ ˖ 🗺️ ▸ ᴇsᴛᴀᴅᴏ: *${data.state}*
║╎⊹ ࣪ ˖ 🏙️ ▸ ᴄɪᴅᴀᴅᴇs (${totalCidades}): 
║╎⊹ ࣪ ˖ _${cidades}${totalCidades > 10 ? "..." : ""}_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");

        } catch (error) {
            console.error("[DDD] Erro:", error.message);
            await replyNYX(ctx, "❌ DDD inválido ou não encontrado.", "bot");
        }
    }
};