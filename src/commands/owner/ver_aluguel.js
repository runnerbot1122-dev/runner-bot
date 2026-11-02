const { requireOwner } = require("../../utils/checkPermission");
const { getRental } = require("../../database/rentals");

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
    name: ["ver_aluguel", "veraluguel"],
    description: "Consulta o registro de aluguel do grupo atual",

    execute: async ctx => {
        requireOwner(ctx);
        if (!ctx.isGroup) {
            return reject(
                ctx,
                "❌ Este comando só funciona em grupos.",
                "RENTAL_GROUP_ONLY"
            );
        }

        try {
            const record = getRental(ctx.chat);
            const message = record
                ? `📋 Aluguel do grupo: ativo\nVencimento: ${record.expiresAt ? formatExpiry(new Date(record.expiresAt)) : "não definido (registro legado)"}\nAtualizado em: ${record.updatedAt}`
                : "ℹ️ Este grupo não possui registro de aluguel.";
            return ctx.replyNYX(message, "bot");
        } catch (error) {
            console.error("Erro ao consultar aluguel:", error);
            return reject(
                ctx,
                "❌ Não foi possível consultar o aluguel local.",
                "RENTAL_STORAGE_ERROR"
            );
        }
    }
};
