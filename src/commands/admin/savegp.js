const ownerOnly = require("../../utils/ownerOnly");
const { setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["savegp", "salvarlink", "salvarlinkgp"],
    description: "Salva o link atual do grupo no banco de dados (Apenas Dono)",
    category: "owner",
    ownerOnly: true,
    execute: async (ctx) => {
        ownerOnly(ctx);

        if (!ctx.isGroup) {
            return replyNYX(ctx, "❌ Apenas grupos.", "user");
        }

        try {
            const codigo = await ctx.sock.groupInviteCode(ctx.chat);
            const link = `https://chat.whatsapp.com/${codigo}`;

            // Salva no groups.json
            setSetting(ctx.chat, "linkSalvo", link);

            await replyNYX(ctx, `╔═━✰『 ʟɪɴᴋ sᴀʟᴠᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ ✅ ▸ O link do grupo foi salvo no banco de dados!\n║╎⊹ ࣪ ˖ 🔗 ▸ *${link}*\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
            
        } catch (e) {
            console.error("[SAVEGP] Erro:", e);
            return replyNYX(ctx, "❌ Não foi possível salvar o link do grupo.", "bot");
        }
    }
};