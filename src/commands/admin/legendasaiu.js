const { requireAdmin } = require("../../utils/checkPermission");
const { setSetting, getSetting } = require("../../utils/groups");

module.exports = {
    name: ["legendasaiu", "legendasaida"],
    description: "Define a legenda de despedida",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const texto = ctx.args.join(" ").trim();

        if (!texto) {
            const atual = getSetting(ctx.chat, "legendasaida") || "Padrão do sistema";
            return ctx.replyNYX(
                `📝 *Legenda atual:*\n${atual}\n\n` +
                `*Tags disponíveis:*\n` +
                `#numero - Nome do usuário\n` +
                `#grupo - Nome do grupo\n\n` +
                `Use: \`${ctx.prefix}legendasaiu Até logo #numero!\``, 
                "user"
            );
        }

        setSetting(ctx.chat, "legendasaida", texto);
        await ctx.react("✅");
        await ctx.replyNYX(`✅ Legenda de despedida atualizada!`, "bot");
    }
};