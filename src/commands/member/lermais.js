const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["lermais"],
    description: "Envia um texto no formato Leia mais",
    execute: async (ctx) => {
        const texto = ctx.args.join(" ").trim();

        if (!texto) {
            return replyNYX(ctx, `📖 *LER MAIS*\n\nUso: *${ctx.prefix}lermais <texto>*`, "bot");
        }

        if (texto.length > 5000) {
            return replyNYX(ctx, "❌ O texto deve ter no máximo 5000 caracteres.", "bot");
        }

        try { await ctx.react("📖"); } catch (e) {}

        // O caractere invisível cria a área que o WhatsApp normalmente recolhe.
        const textoRecolhivel = `${"\u200e".repeat(4000)}${texto}`;
        await replyNYX(ctx, textoRecolhivel, "bot");
    }
};
