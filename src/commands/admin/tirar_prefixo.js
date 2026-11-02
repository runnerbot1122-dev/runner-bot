const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["tirar_prefixo", "tirarprefixo", "rm_prefixo"],
    description: "Remove um prefixo extra do grupo",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, args, isAdmin } = ctx;
        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores.", "user");

        const prefixo = (args[0] || "").trim();
        if (!prefixo) return replyNYX(ctx, "❌ Informe o prefixo que deseja remover. Ex: *tirar_prefixo /*", "user");

        let lista = getSetting(chat, "extrasPrefixos") || [];
        if (!lista.includes(prefixo)) {
            return replyNYX(ctx, `❌ O prefixo *${prefixo}* não está na lista.`, "user");
        }

        lista = lista.filter(p => p !== prefixo);
        setSetting(chat, "extrasPrefixos", lista);
        await ctx.react("✅");
        return replyNYX(ctx, `✅ Prefixo *${prefixo}* removido!`, "user");
    }
};