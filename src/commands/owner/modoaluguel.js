const { requireOwner } = require("../../utils/checkPermission");
const { toggleRentalMode } = require("../../database/rentals");

async function reject(ctx, message, code) {
    await ctx.replyNYX(message, "bot");
    throw new Error(code);
}

module.exports = {
    name: "modoaluguel",
    description: "Alterna o modo global de aluguel",

    execute: async ctx => {
        requireOwner(ctx);

        try {
            const enabled = toggleRentalMode();
            return ctx.replyNYX(
                enabled
                    ? "✅ Modo aluguel ativado."
                    : "✅ Modo aluguel desativado.",
                "bot"
            );
        } catch (error) {
            console.error("Erro ao alternar modo aluguel:", error);
            return reject(
                ctx,
                "❌ Não foi possível persistir o modo aluguel.",
                "RENTAL_MODE_STORAGE_ERROR"
            );
        }
    }
};
