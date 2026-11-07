const { requireAdmin } = require("../../utils/checkPermission");
const sendLinkGrupo = require("../../utils/sendLinkGrupo");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: [
        "link",
        "linkgrupo",
        "linkgp",
        "linkgroup"
    ],
    execute: async(ctx) => {
        requireAdmin(ctx);

        if(!ctx.isGroup){
            return replyNYX(ctx, "❌ Apenas grupos.", "user");
        }

        try {
            const codigo = await ctx.sock.groupInviteCode(ctx.chat);
            const link = `https://chat.whatsapp.com/${codigo}`;
            await sendLinkGrupo(ctx, link);
        } catch (error) {
            console.error("[LINK] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui pegar o link. Verifique se o bot é admin.", "bot");
        }
    }
};