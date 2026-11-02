const ownerOnly = require("../../utils/ownerOnly");
const security = require("../../database/securityGroups");

module.exports = {
    name: ["listperm"],
    description: "Lista as permissões manuais do grupo",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use no grupo.", "bot");

        const perms = security.getPerms(ctx.chat);
        const users = Object.keys(perms);

        if (users.length === 0) {
            return ctx.replyNYX("ℹ️ Nenhuma permissão manual registrada neste grupo.", "bot");
        }

        const linhas = users.map(u => `• @${u.split("@")[0]}: ${perms[u].join(", ")}`);
        await ctx.replyNYX({
            text: `📋 *Permissões Manuais do Grupo:*\n\n${linhas.join("\n")}`,
            mentions: users
        }, "bot");
    }
};