const replyNYX = require("../../utils/replyNYX");
const familyDb = require("../../database/families");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["minhadupla", "dupla", "meupar", "meucasal", "casal"],
    description: "Mostra informações sobre o seu relacionamento",
    execute: async (ctx) => {
        const familia = familyDb.getFamilyOf(ctx.sender);

        if (!familia) {
            return replyNYX(ctx, 
                `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🥀 ▸ ᴠᴏᴄê ɴãᴏ ᴇsᴛá ɴᴀᴍᴏʀᴀɴᴅᴏ ɴɪɴɢᴜéᴍ ᴀᴛᴜᴀʟᴍᴇɴᴛᴇ.\n\n║╎⊹ ࣪ ˖ 💍 ▸ ᴜsᴇ *${ctx.prefix}namorar* ᴘᴀʀᴀ ᴄʜᴀᴍᴀʀ ᴀʟɢᴜéᴍ!\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                "user");
        }

        const parceiro = familia.casal.find(id => id !== ctx.sender);
        const qtdFilhos = familia.filhos.length;
        
        let textoFilhos = "Nenhum";
        if (qtdFilhos > 0) {
            textoFilhos = familia.filhos.map(f => `@${f.split("@")[0]}`).join(", ");
        }

        const historiaFormatada = fonteNYX(familia.historia);

        const texto = 
`╔═━✰『 💍 ᴍᴇᴜ ᴄᴀsᴀʟ 』═━✰

║╎⊹ ࣪ ˖ 💖 ▸ ᴘᴀʀᴄᴇɪʀᴏ(a): @${parceiro.split("@")[0]}
║╎⊹ ࣪ ˖ 👶 ▸ ғɪʟʜᴏs (${qtdFilhos}): ${textoFilhos}
║╎⊹ ࣪ ˖ 📅 ▸ ᴅᴇsᴅᴇ: *${familia.dataCriacao}*
║╎⊹ ࣪ ˖ 🆔 ▸ ɪᴅ: *${familia.id}*

║╎⊹ ࣪ ˖ 📖 ▸ ʜɪsᴛóʀɪᴀ:
║╎⊹ ࣪ ˖ _${historiaFormatada}_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        const mentions = [ctx.sender, parceiro, ...familia.filhos];
        await replyNYX(ctx, { text: texto, mentions }, "bot");
    }
};