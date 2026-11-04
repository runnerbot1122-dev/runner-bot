const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const { getExistingUser } = require("../../utils/users");
const database = require("../../database/database");

module.exports = {
    name: ["meumelhoramigo", "meumelhorpar", "bff"],
    description: "Define ou mostra seu melhor amigo no bot",
    execute: async (ctx) => {
        const alvo = getTarget(ctx);
        const user = getExistingUser([ctx.sender]);
        
        if (!user) return replyNYX(ctx, "❌ Você precisa ter um registro no bot primeiro.", "user");

        // Se marcou alguém, define como melhor amigo
        if (alvo) {
            if (alvo === ctx.sender) return replyNYX(ctx, "❌ Você não pode ser seu próprio melhor amigo!", "user");
            
            const id = Object.keys(database.users).find(k => database.users[k] === user);
            if (id) {
                database.users[id].melhorAmigo = alvo;
                database.saveUsers();
            }

            try { await ctx.react("👯"); } catch (e) {}

            return replyNYX(ctx, 
                { 
                    text: `╔═━✰『 ɴᴏᴠᴏ ʙғғ 』═━✰\n\n║╎⊹ ࣪ ˖ 👯 ▸ @${ctx.sender.split("@")[0]} ᴅᴇғɪɴɪᴜ @${alvo.split("@")[0]} ᴄᴏᴍᴏ ᴍᴇʟʜᴏʀ ᴀᴍɪɢᴏ(a)!\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                    mentions: [ctx.sender, alvo] 
                }, 
                "bot");
        }

        // Se não marcou, mostra o atual
        if (user.melhorAmigo) {
            try { await ctx.react("💙"); } catch (e) {}
            return replyNYX(ctx, 
                { 
                    text: `╔═━✰『 ᴍᴇᴜ ʙғғ 』═━✰\n\n║╎⊹ ࣪ ˖ 👯 ▸ @${ctx.sender.split("@")[0]}\n║╎⊹ ࣪ ˖ 💙 ▸ ᴍᴇʟʜᴏʀ ᴀᴍɪɢᴏ(a): @${user.melhorAmigo.split("@")[0]}\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                    mentions: [ctx.sender, user.melhorAmigo] 
                }, 
                "bot");
        }

        return replyNYX(ctx, `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 💭 ▸ ᴠᴏᴄê ᴀɪɴᴅᴀ ɴãᴏ ᴅᴇғɪɴɪᴜ ᴜᴍ ᴍᴇʟʜᴏʀ ᴀᴍɪɢᴏ.\n║╎⊹ ࣪ ˖ 👉 ▸ ᴜsᴇ *${ctx.prefix}meumelhoramigo @alguém*\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
    }
};