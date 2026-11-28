const { requireAdmin } = require("../../utils/checkPermission");
const scheduler = require("../../core/scheduler");

function formatarData(timestamp) {
    return new Date(timestamp).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

module.exports = {
    name: ["lembretesgrupo", "listarlembretes", "listarlembretesgrupo"],
    description: "Lista os lembretes pendentes do grupo",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const tarefas = scheduler.listChatTasks(ctx.chat);
        if (!tarefas.length) return ctx.replyNYX("ℹ️ Não há lembretes pendentes neste grupo.", "bot");
        const linhas = tarefas.slice(0, 50).map(tarefa => {
            const autor = String(tarefa.sender || "").split("@")[0].split(":")[0] || "desconhecido";
            return `• *${tarefa.id}* — ${formatarData(tarefa.dueAt)} — @${autor}\n  ${tarefa.text}`;
        });
        const extra = tarefas.length > linhas.length ? `\n\n… e mais ${tarefas.length - linhas.length} lembrete(s).` : "";
        return ctx.replyNYX(
            `⏰ *LEMBRETES PENDENTES DO GRUPO*\n\n${linhas.join("\n")} ${extra}\n\nCancele um com *${ctx.prefix}cancelarlembrete <id>* ou todos com *${ctx.prefix}limparlembretes*.`,
            "bot"
        );
    }
};
