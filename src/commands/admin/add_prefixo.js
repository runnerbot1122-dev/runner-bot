const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["add_prefixo", "addprefixo"],
    description: "Adiciona um prefixo extra para o grupo",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, args, isAdmin } = ctx;
        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores.", "user");

        const novoPrefixo = (args[0] || "").trim();
        if (!novoPrefixo || novoPrefixo.length > 3) {
            return replyNYX(ctx, "❌ Informe um prefixo válido (até 3 caracteres). Ex: *add_prefixo /*", "user");
        }

        const lista = getSetting(chat, "extrasPrefixos") || [];
        if (lista.includes(novoPrefixo)) {
            return replyNYX(ctx, `❌ O prefixo *${novoPrefixo}* já está na lista.`, "user");
        }

        lista.push(novoPrefixo);
        setSetting(chat, "extrasPrefixos", lista);
        await ctx.react("✅");
        return replyNYX(ctx, `✅ Prefixo *${novoPrefixo}* adicionado!\n\nO bot agora aceita: *${getSetting(chat, "prefix") || "7"}* e *${novoPrefixo}*.`, "user");
    }
};