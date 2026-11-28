const { requireAdmin } = require("../../utils/checkPermission");
const scheduler = require("../../core/scheduler");

module.exports = {
    name: ["cancelarlembrete", "removerlembrete"],
    description: "Cancela um lembrete pendente do grupo",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const id = String((ctx.args || [])[0] || "").trim();
        if (!id) return ctx.replyNYX(`⚙️ Uso: *${ctx.prefix}cancelarlembrete <id>*\nExemplo: *${ctx.prefix}cancelarlembrete lm-a1b2c3d4*`, "bot");
        const resultado = scheduler.cancelTask(id, {
            chat: ctx.chat,
            sender: ctx.sender,
            isAdmin: ctx.isAdmin,
            isOwner: ctx.isOwner
        });
        if (!resultado.found) return ctx.replyNYX("❌ Lembrete não encontrado neste grupo ou já executado.", "bot");
        return ctx.replyNYX(`✅ Lembrete *${resultado.task.id}* cancelado pelo administrador.`, "bot");
    }
};
