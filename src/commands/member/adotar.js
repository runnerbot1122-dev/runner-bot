const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const familyDb = require("../../database/families");

module.exports = {
    name: ["adotar", "adotarfilho"],
    description: "Adota alguém como filho no seu casamento",
    execute: async (ctx) => {
        const alvo = getTarget(ctx);
        
        if (!alvo) return replyNYX(ctx, `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ ⚠️ ▸ ᴍᴀʀǫᴜᴇ ᴀʟɢᴜéᴍ ᴘᴀʀᴀ ᴀᴅᴏᴛᴀʀ!\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
        if (alvo === ctx.sender) return replyNYX(ctx, `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🪞 ▸ ᴠᴏᴄê ɴãᴏ ᴘᴏᴅᴇ sᴇ ᴀᴅᴏᴛᴀʀ!\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");

        const familia = familyDb.getFamilyOf(ctx.sender);
        if (!familia) {
            return replyNYX(ctx, `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🥀 ▸ ᴠᴏᴄê ᴘʀᴇᴄɪsᴀ ᴇsᴛᴀʀ ɴᴀᴍᴏʀᴀɴᴅᴏ ᴘᴀʀᴀ ᴀᴅᴏᴛᴀʀ.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "user");
        }

        const familiaAlvo = familyDb.getFamilyOf(alvo);
        if (familiaAlvo) {
            return replyNYX(ctx, `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🚫 ▸ ᴇssᴀ ᴘᴇssᴏᴀ ᴊá ᴘᴇʀᴛᴇɴᴄᴇ ᴀ ᴜᴍᴀ ғᴀᴍíʟɪᴀ.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "user");
        }

        familyDb.addChild(familia.id, alvo);
        try { await ctx.react("👶"); } catch (e) {}

        const texto = 
`╔═━✰『 ɴᴏᴠᴀ ᴀᴅᴏçãᴏ 』═━✰

║╎⊹ ࣪ ˖ 👶 ▸ @${alvo.split("@")[0]} ғᴏɪ ᴀᴅᴏᴛᴀᴅᴏ(a)!
║╎⊹ ࣪ ˖ 👨‍👩‍👦 ▸ ᴘᴏʀ: @${ctx.sender.split("@")[0]}

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: [ctx.sender, alvo] }, "bot");
    }
};