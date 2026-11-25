const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["spoiler"],
    description: "Envia um texto oculto como spoiler",
    execute: async (ctx) => {
        const texto = ctx.args.join(" ").trim();

        if (!texto) {
            return replyNYX(ctx, `🙈 *SPOILER*\n\nUso: *${ctx.prefix}spoiler <texto>*`, "bot");
        }

        try { await ctx.react("🙈"); } catch (e) {}
        await replyNYX(ctx, `||${texto}||`, "bot");
    }
};
