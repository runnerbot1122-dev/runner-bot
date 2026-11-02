const ownerOnly = require("../../utils/ownerOnly");
const security = require("../../database/securityGroups");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["clearperm"],
    description: "Remove todas as permissões de um usuário",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use no grupo.", "bot");

        let target = getTarget(ctx);
        if (!target && ctx.args[0]) {
            const digits = String(ctx.args[0]).replace(/\D/g, '');
            if (digits.length >= 10 && digits.length <= 15) {
                target = digits + '@s.whatsapp.net';
            }
        }

        if (!target) return ctx.replyNYX("❌ Marque/responda à mensagem do usuário ou informe um número válido.", "bot");

        const changed = security.clearPerms(ctx.chat, target);
        await ctx.replyNYX({
            text: changed 
                ? `🧹 Todas as permissões de @${target.split("@")[0]} foram removidas.`
                : `ℹ️ @${target.split("@")[0]} não tinha permissões registradas.`,
            mentions: [target]
        }, "bot");
    }
};