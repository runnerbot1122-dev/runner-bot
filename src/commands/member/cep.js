const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["cep"],
    description: "Busca o endereço de um CEP",
    execute: async (ctx) => {
        const cep = ctx.args[0] ? ctx.args[0].replace(/\D/g, '') : "";
        if (!cep || cep.length !== 8) {
            return replyNYX(ctx, `📮 *CONSULTAR CEP*\n\nUso: ${ctx.prefix}cep 01001000`, "bot");
        }

        try { await ctx.react("📮"); } catch (e) {}

        try {
            const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 8000 });
            const data = res.data;

            if (data.erro) {
                return replyNYX(ctx, "❌ CEP não encontrado.", "bot");
            }

            const texto = 
`╔═━✰『 ᴄᴏɴsᴜʟᴛᴀ ᴄᴇᴘ 』═━✰

║╎⊹ ࣪ ˖ 📮 ▸ *${data.cep}*
║╎⊹ ࣪ ˖ 🏠 ▸ ʀᴜᴀ: *${data.logradouro || "N/A"}*
║╎⊹ ࣪ ˖ 🏘️ ▸ ʙᴀɪʀʀᴏ: *${data.bairro || "N/A"}*
║╎⊹ ࣪ ˖ 🏙️ ▸ ᴄɪᴅᴀᴅᴇ: *${data.localidade}*
║╎⊹ ࣪ ˖ 🗺️ ▸ ᴇsᴛᴀᴅᴏ: *${data.uf}*
║╎⊹ ࣪ ˖ 📞 ▸ ᴅᴅᴅ: *${data.ddd}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");

        } catch (error) {
            console.error("[CEP] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui consultar esse CEP.", "bot");
        }
    }
};