const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const { getExistingUser } = require("../../utils/users");

module.exports = {
    name: ["meunumero", "numeroid", "meuid"],
    description: "Mostra o número e ID do usuário",
    execute: async (ctx) => {
        const alvo = getTarget(ctx) || ctx.sender;
        const user = getExistingUser([alvo]);
        
        let numeroReal = alvo;
        let lidReal = "Não registrado";

        // Se o alvo for um LID, tenta achar o JID real no banco
        if (alvo.endsWith("@lid")) {
            if (user && user.jid) {
                numeroReal = user.jid;
            }
            lidReal = alvo.split("@")[0];
        } else {
            // Se for JID normal, o LID tá no banco (se existir)
            numeroReal = alvo;
            if (user && user.lid) {
                lidReal = user.lid.split("@")[0];
            }
        }

        const numeroExibicao = numeroReal.split("@")[0];
        
        try { await ctx.react("🆔"); } catch (e) {}

        const texto = 
`╔═━✰『 ᴍᴇᴜs ᴅᴀᴅᴏs 』═━✰

║╎⊹ ࣪ ˖ 👤 ▸ @${numeroExibicao}
║╎⊹ ࣪ ˖ 📱 ▸ ɴúᴍᴇʀᴏ: *${numeroExibicao}*
║╎⊹ ࣪ ˖ 🆔 ▸ ʟɪᴅ: *${lidReal}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: [numeroReal] }, "bot");
    }
};