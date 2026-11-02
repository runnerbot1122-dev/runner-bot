const { requireOwner } = require("../../utils/checkPermission");
const { listRentals } = require("../../database/rentals");

function formatExpiry(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).format(date);
}

async function reject(ctx, message, code) {
    await ctx.replyNYX(message, "bot");
    throw new Error(code);
}

module.exports = {
    name: "lista_aluguel",
    description: "Lista os registros locais de aluguel",

    execute: async ctx => {
        requireOwner(ctx);

        try {
            const records = listRentals();
            const message = records.length
                ? [
                    "📋 Registros locais de aluguel:",
                    ...records.map(record => (
                        `• ${record.groupId} — ${record.expiresAt ? `ativo até ${formatExpiry(new Date(record.expiresAt))}` : "ativo (registro legado)"}`
                    ))
                ].join("\n")
                : "ℹ️ Não há registros locais de aluguel.";
            return ctx.replyNYX(message, "bot");
        } catch (error) {
            console.error("Erro ao listar aluguéis:", error);
            return reject(
                ctx,
                "❌ Não foi possível listar os aluguéis locais.",
                "RENTAL_STORAGE_ERROR"
            );
        }
    }
};
