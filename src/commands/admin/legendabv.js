const { requireAdmin } = require("../../utils/checkPermission");
const { setSetting, getSetting } = require("../../utils/groups");

module.exports = {
    name: ["legendabv"],
    description: "Define a legenda de boas-vindas",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const texto = ctx.args.join(" ").trim();

        if (!texto) {
            const atual = getSetting(ctx.chat, "legendabv") || "Bem-vindo(a) ao grupo!";
            return ctx.replyNYX(
                `📝 *Legenda atual:*\n${atual}\n\n` +
                `*Tags disponíveis:*\n` +
                `#numero - Marca o usuário\n` +
                `#grupo - Nome do grupo\n\n` +
                `Use: \`${ctx.prefix}legendabv Olá #numero, bem-vindo ao #grupo\``, 
                "user"
            );
        }

        setSetting(ctx.chat, "legendabv", texto);
        await ctx.react("✅");
        await ctx.replyNYX(`✅ Legenda de boas-vindas atualizada!`, "bot");
    }
};