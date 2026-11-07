const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["ip", "ipinfo"],
    description: "Busca informações de um IP",
    execute: async (ctx) => {
        const ip = ctx.args[0];
        if (!ip) {
            return replyNYX(ctx, `🌐 *CONSULTAR IP*\n\nUso: ${ctx.prefix}ip 8.8.8.8`, "bot");
        }

        try { await ctx.react("🌐"); } catch (e) {}

        try {
            const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,query`, { timeout: 8000 });
            const data = res.data;

            if (data.status !== "success") {
                return replyNYX(ctx, "❌ IP inválido ou não encontrado.", "bot");
            }

            const texto = 
`╔═━✰『 ɪɴғᴏ ɪᴘ 』═━✰

║╎⊹ ࣪ ˖ 🌐 ▸ ɪᴘ: *${data.query}*
║╎⊹ ࣪ ˖ 🌍 ▸ ᴘᴀís: *${data.country}*
║╎⊹ ࣪ ˖ 🏙️ ▸ ᴄɪᴅᴀᴅᴇ: *${data.city} (${data.regionName})*
║╎⊹ ࣪ ˖ 📡 ▸ ɪsᴘ: *${data.isp}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");

        } catch (error) {
            console.error("[IP] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui consultar esse IP.", "bot");
        }
    }
};