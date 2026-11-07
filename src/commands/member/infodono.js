const replyNYX = require("../../utils/replyNYX");
const config = require("../../config/config");

module.exports = {
    name: ["infodono", "donoinfo"],
    description: "Mostra o contato do dono do bot",
    execute: async (ctx) => {
        // Puxa o número do config.js (masterNumber)
        const numeroDono = config.masterNumber || "Não configurado";
        const linkPV = numeroDono !== "Não configurado" ? `https://wa.me/${numeroDono}` : "N/A";

        const texto = 
`╔═━✰『 ᴅᴏɴᴏ ᴅᴏ ʙᴏᴛ 』═━✰

║╎⊹ ࣪ ˖ 👤 ▸ @${numeroDono}
║╎⊹ ࣪ ˖ 📱 ▸ ᴡʜᴀᴛsᴀᴘᴘ: ${linkPV}

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        // Marca o dono (só se ele existir)
        const mentions = numeroDono !== "Não configurado" ? [`${numeroDono}@s.whatsapp.net`] : [];

        await replyNYX(ctx, { text: texto, mentions }, "bot");
    }
};