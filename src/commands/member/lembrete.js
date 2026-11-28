const replyNYX = require("../../utils/replyNYX");
const scheduler = require("../../core/scheduler");

function instrucoes(ctx) {
    return `⏰ *LEMBRETE*\n\nUso: *${ctx.prefix}lembrete <tempo> <mensagem>*\n\nTempo: use *s* (segundos), *m* (minutos) ou *h* (horas).\nExemplo: *${ctx.prefix}lembrete 10m Tomar água*\n\nGerenciar:\n• *${ctx.prefix}lembrete listar*\n• *${ctx.prefix}lembrete cancelar <id>*`;
}

function erroDoScheduler(error) {
    if (error?.message === "LIMITE_TAREFAS") return "❌ Você já possui o limite de 20 lembretes pendentes neste chat.";
    if (error?.message === "TEMPO_INVALIDO") return "❌ O tempo deve ficar entre 1 segundo e 30 dias.";
    return "❌ Não consegui salvar este lembrete agora. Tente novamente.";
}

function formatarData(timestamp) {
    return new Date(timestamp).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

module.exports = {
    name: ["lembrete", "lembrar", "timer"],
    description: "Cria e gerencia lembretes persistentes",
    async execute(ctx) {
        const args = Array.isArray(ctx.args) ? ctx.args : [];
        const subcomando = String(args[0] || "").toLowerCase();

        if (["listar", "lista", "list", "pendentes"].includes(subcomando)) {
            const tarefas = scheduler.listTasks(ctx.chat, ctx.sender);
            if (!tarefas.length) return replyNYX(ctx, "ℹ️ Você não possui lembretes pendentes neste chat.", "bot");
            const linhas = tarefas.map(tarefa => `• *${tarefa.id}* — ${formatarData(tarefa.dueAt)} — ${tarefa.text}`);
            return replyNYX(ctx, `⏰ *SEUS LEMBRETES PENDENTES*\n\n${linhas.join("\n")}\n\nPara cancelar: *${ctx.prefix}lembrete cancelar <id>*`, "bot");
        }

        if (["cancelar", "cancel", "remover", "excluir"].includes(subcomando)) {
            const id = args[1];
            if (!id) return replyNYX(ctx, `❌ Informe o ID. Exemplo: *${ctx.prefix}lembrete cancelar lm-a1b2c3d4*`, "bot");
            const resultado = scheduler.cancelTask(id, { chat: ctx.chat, sender: ctx.sender, isAdmin: ctx.isAdmin, isOwner: ctx.isOwner });
            if (resultado.unauthorized) return replyNYX(ctx, "❌ Esse lembrete pertence a outro usuário. Apenas o autor, um admin ou o dono pode cancelá-lo.", "bot");
            if (!resultado.found) return replyNYX(ctx, "❌ Lembrete não encontrado ou já executado.", "bot");
            return replyNYX(ctx, `✅ Lembrete *${resultado.task.id}* cancelado.`, "bot");
        }

        if (args.length < 2) return replyNYX(ctx, instrucoes(ctx), "bot");
        const delayMs = scheduler.parseDuration(args[0]);
        const mensagem = args.slice(1).join(" ").trim();
        if (!delayMs) return replyNYX(ctx, "❌ Formato de tempo inválido. Use s, m ou h, entre 1 segundo e 30 dias. Exemplo: 10m ou 30s.", "bot");
        if (!mensagem) return replyNYX(ctx, "❌ Informe o texto do lembrete.", "bot");
        if (mensagem.length > 1000) return replyNYX(ctx, "❌ O texto do lembrete deve ter no máximo 1000 caracteres.", "bot");

        let tarefa;
        try {
            tarefa = scheduler.createTask({ chat: ctx.chat, sender: ctx.sender, text: mensagem, delayMs, sessionId: ctx.sessionId });
        } catch (error) {
            console.error("[LEMBRETE] Falha ao criar:", error.message);
            return replyNYX(ctx, erroDoScheduler(error), "bot");
        }

        try { await ctx.react("⏰"); } catch (error) {}
        return replyNYX(ctx, `⏰ Lembrete salvo com o ID *${tarefa.id}*.\n\nVou te lembrar de *"${mensagem}"* em *${scheduler.formatDuration(delayMs)}*.\n\nVocê pode cancelar com *${ctx.prefix}lembrete cancelar ${tarefa.id}* ou listar com *${ctx.prefix}lembrete listar*.`, "bot");
    }
};
