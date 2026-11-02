const { requireAdmin } = require("../../utils/checkPermission");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: ["mudarftgp"],
    description: "Altera a foto do grupo",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const quoted = ctx.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = quoted?.imageMessage || ctx.message?.message?.imageMessage;

        if (!imageMsg) return ctx.reply("❌ Marque uma imagem ou envie com o comando na legenda.");

        try {
            await ctx.sock.updateProfilePicture(ctx.chat, await downloadMediaMessage({ message: { imageMessage: imageMsg } }, "buffer", {}, { logger: console }));
            await ctx.replyNYX("✅ Foto do grupo atualizada!", "bot");
        } catch (e) {
            await ctx.reply("❌ Não consegui alterar a foto.");
        }
    }
};