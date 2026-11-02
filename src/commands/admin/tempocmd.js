const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["tempocmd", "tempo_comando"],
    description: "Define o tempo de espera (cooldown) entre comandos",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, args, isAdmin } = ctx;
        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores.", "user");

        const valor = parseInt(args[0]);
        if (isNaN(valor) || valor < 0) {
            return replyNYX(ctx, `⚙️ *TEMPO DE COMANDO*\n\nAtual: *${getSetting(chat, "tempoComando") || "0"} segundos*\n\nUse: *${ctx.prefix}tempocmd 5* (ou 0 para desativar)`, "user");
        }

        setSetting(chat, "tempoComando", valor);
        await ctx.react("✅");
        
        if (valor === 0) {
            return replyNYX(ctx, "🔓 Tempo entre comandos *desativado*.", "user");
        }
        return replyNYX(ctx, `✅ Tempo entre comandos definido para *${valor} segundos*.`, "user");
    }
};