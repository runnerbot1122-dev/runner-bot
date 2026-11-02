const ownerOnly = require("../../utils/ownerOnly");
const security = require("../../database/securityGroups");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["rmperm"],
    description: "Remove a permissão de um usuário para um comando",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use no grupo.", "bot");

        const comando = ctx.args[0]?.toLowerCase();
        if (!comando) return ctx.replyNYX("❌ Use: 7rmperm <comando> marcando/respondendo ou informando o número.", "bot");

        let target = getTarget(ctx);
        if (!target && ctx.args[1]) {
            const digits = String(ctx.args[1]).replace(/\D/g, '');
            if (digits.length >= 10 && digits.length <= 15) {
                target = digits + '@s.whatsapp.net';
            }
        }

        if (!target) return ctx.replyNYX("❌ Marque/responda à mensagem do usuário ou informe um número válido.", "bot");

        const changed = security.removePerm(ctx.chat, target, comando);
        await ctx.replyNYX({
            text: changed 
                ? `🔒 Permissão do comando *${comando}* removida de @${target.split("@")[0]}.`
                : `ℹ️ @${target.split("@")[0]} não tinha permissão para *${comando}*.`,
            mentions: [target]
        }, "bot");
    }
};