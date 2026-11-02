const { requireOwner } = require("../../utils/checkPermission");
const { removeRental } = require("../../database/rentals");

async function reject(ctx, message, code) {
    await ctx.replyNYX(message, "bot");
    throw new Error(code);
}

module.exports = {
    name: ["rm_aluguel", "removealuguel", "removeraluguel"],
    description: "Remove o registro de aluguel do grupo atual",

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
            const removed = removeRental(ctx.chat);
            return ctx.replyNYX(
                removed
                    ? "✅ Registro de aluguel removido."
                    : "ℹ️ Este grupo não possui registro de aluguel.",
                "bot"
            );
        } catch (error) {
            console.error("Erro ao remover aluguel:", error);
            return reject(
                ctx,
                "❌ Não foi possível remover o aluguel local.",
                "RENTAL_STORAGE_ERROR"
            );
        }
    }
};
