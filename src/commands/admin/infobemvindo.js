const { requireAdmin } = require("../../utils/checkPermission");
const { getSetting } = require("../../utils/groups");

module.exports = {
    name: ["infobemvindo", "infobv"],
    description: "Mostra as configurações de boas-vindas",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const ativo = getSetting(ctx.chat, "welcome") === true;
        const legenda = getSetting(ctx.chat, "legendabv") || "Padrão do sistema";

        const texto = `📋 *INFO BOAS-VINDAS*\n\n` +
                      `🔔 Status: ${ativo ? "✅ Ativado" : "❌ Desativado"}\n` +
                      `📝 Legenda atual: ${legenda}`;

        await ctx.replyNYX(texto, "user");
    }
};