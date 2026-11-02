const { requireAdmin } = require("../../utils/checkPermission");
const { getSetting } = require("../../utils/groups");

module.exports = {
    name: ["testebv"],
    description: "Testa a mensagem de boas-vindas",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const legenda = getSetting(ctx.chat, "legendabv") || "Bem-vindo(a) ao grupo!";

        // Simula uma menção a quem mandou o comando
        await ctx.replyNYX({
            text: legenda.replace(/{nome}/gi, `@${ctx.sender.split("@")[0]}`),
            mentions: [ctx.sender]
        }, "bot");
    }
};