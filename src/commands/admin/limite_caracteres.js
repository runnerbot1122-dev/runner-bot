const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["limite_caracteres", "limitecaracteres", "limite_letras"],
    description: "Define o limite máximo de caracteres nas mensagens do grupo",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, args, isAdmin } = ctx;
        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores.", "user");

        const valor = parseInt(args[0]);
        if (isNaN(valor) || valor < 0) {
            return replyNYX(ctx, `⚙️ *LIMITE DE CARACTERES*\n\nAtual: *${getSetting(chat, "limiteCaracteres") || "Desativado"}*\n\nUse: *${ctx.prefix}limite_caracteres 500* (ou 0 para desativar)`, "user");
        }

        setSetting(chat, "limiteCaracteres", valor);
        await ctx.react("✅");
        
        if (valor === 0) {
            return replyNYX(ctx, "🔓 Limite de caracteres *desativado*.", "user");
        }
        return replyNYX(ctx, `✅ Limite de caracteres definido para *${valor}*.`, "user");
    }
};