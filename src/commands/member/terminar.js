const replyNYX = require("../../utils/replyNYX");
const familyDb = require("../../database/families");

module.exports = {
    name: ["terminar", "divorciar", "separar"],
    description: "Termina o relacionamento atual",
    execute: async (ctx) => {
        const familia = familyDb.getFamilyOf(ctx.sender);

        if (!familia) {
            return replyNYX(ctx, 
                `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 💔 ▸ ᴠᴏᴄê ɴãᴏ ᴇsᴛá ɴᴀᴍᴏʀᴀɴᴅᴏ ɴɪɴɢᴜéᴍ ᴘᴀʀᴀ ᴛᴇʀᴍɪɴᴀʀ!\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                "bot");
        }

        const parceiro = familia.casal.find(id => id !== ctx.sender);
        familyDb.deleteFamily(familia.id);

        try { await ctx.react("💔"); } catch (e) {}

        const texto = 
`╔═━✰『 ғɪᴍ ᴅᴏ ʀᴇʟᴀᴄɪᴏɴᴀᴍᴇɴᴛᴏ 』═━✰

║╎⊹ ࣪ ˖ 💔 ▸ ᴏ ᴄᴀsᴀʟ ᴛᴇʀᴍɪɴᴏᴜ!
║╎⊹ ࣪ ˖ 🥀 ▸ @${ctx.sender.split("@")[0]} ᴇ @${parceiro.split("@")[0]} ɴãᴏ ᴇsᴛãᴏ ᴍᴀɪs ɴᴀᴍᴏʀᴀɴᴅᴏ.
║╎⊹ ࣪ ˖ 💭 ▸ _Cada um pro seu lado agora._

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: [ctx.sender, parceiro] }, "bot");
    }
};