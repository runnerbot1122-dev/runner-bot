const { requireAdmin } = require("../../utils/checkPermission");

module.exports = {
    name: ["ephemeral"],
    description: "Ativa/desativa mensagens temporárias",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");
        
        const tempo = ctx.args[0] === "0" ? 0 : parseInt(ctx.args[0]) || 86400; // Padrão 24h
        try {
            await ctx.sock.groupToggleEphemeral(ctx.chat, tempo);
            await ctx.replyNYX(tempo === 0 ? "✅ Mensagens temporárias desativadas." : `✅ Mensagens temporárias ativadas para ${tempo / 3600}h.`, "bot");
        } catch (e) {
            await ctx.reply("❌ Não consegui alterar as mensagens temporárias.");
        }
    }
};