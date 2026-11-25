const { getBotEmoji } = require("../../utils/botEmoji");
const replyNYX = require("../../utils/replyNYX");
const config = require("../../config/config");

module.exports = {
    name: ["donos", "owners"],
    description: "Lista os donos do bot",
    execute: async (ctx) => {
        let texto = `╔═━✰『 ᴅᴏɴᴏs 』═━✰\n\n`;
        
        // Puxa o mestre principal
        const donoPrincipal = config.masterNumber;
        const donosExtras = (config.owners || []).filter(n => n !== donoPrincipal); // Remove o principal pra não duplicar

        if (!donoPrincipal && donosExtras.length === 0) {
            return replyNYX(ctx, "⚠️ Nenhum dono configurado.", "bot");
        }

        if (donoPrincipal) {
            texto += `║╎⊹ ࣪ ˖ 👑 ▸ *Criador:* @${donoPrincipal}\n\n`;
        }

        if (donosExtras.length > 0) {
            texto += `║╎⊹ ࣪ ˖ 🛡️ ▸ *Subdonos:*\n`;
            donosExtras.forEach(d => {
                texto += `║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ @${d}\n`;
            });
        }

        texto += `\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;
        
        // Prepara as menções
        const mentions = [donoPrincipal, ...donosExtras]
            .filter(Boolean)
            .map(n => `${n}@s.whatsapp.net`);

        await replyNYX(ctx, { text: texto, mentions }, "bot");
    }
};