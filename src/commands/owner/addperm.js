const ownerOnly = require("../../utils/ownerOnly");
const security = require("../../database/securityGroups");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["addperm"],
    description: "Dá permissão a um usuário para usar um comando específico",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use no grupo.", "bot");

        const comando = ctx.args[0]?.toLowerCase();
        if (!comando) return ctx.replyNYX("❌ Use: 7addperm <comando> marcando/respondendo ou informando o número.", "bot");

        // Tenta pegar a marcação/resposta
        let target = getTarget(ctx);

        // Se não achou, tenta pegar pelo número digitado no argumento 2
        if (!target && ctx.args[1]) {
            const digits = String(ctx.args[1]).replace(/\D/g, '');
            if (digits.length >= 10 && digits.length <= 15) {
                target = digits + '@s.whatsapp.net';
            }
        }

        if (!target) return ctx.replyNYX("❌ Marque/responda à mensagem do usuário ou informe um número válido.", "bot");

        const changed = security.addPerm(ctx.chat, target, comando);
        await ctx.replyNYX({
            text: changed 
                ? `✅ @${target.split("@")[0]} agora pode usar o comando *${comando}*.`
                : `ℹ️ @${target.split("@")[0]} já tinha permissão para *${comando}*.`,
            mentions: [target]
        }, "bot");
    }
};