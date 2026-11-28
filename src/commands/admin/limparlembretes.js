const { requireAdmin } = require("../../utils/checkPermission");
const scheduler = require("../../core/scheduler");

module.exports = {
    name: ["limparlembretes", "limparembretes"],
    description: "Remove todos os lembretes pendentes do grupo",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const removidas = scheduler.cancelTasksForChat(ctx.chat, {
            chat: ctx.chat,
            sender: ctx.sender,
            isAdmin: ctx.isAdmin,
            isOwner: ctx.isOwner
        });
        if (!removidas.length) return ctx.replyNYX("ℹ️ Não havia lembretes pendentes para limpar neste grupo.", "bot");
        return ctx.replyNYX(`✅ ${removidas.length} lembrete(s) pendente(s) foram removidos deste grupo.`, "bot");
    }
};
