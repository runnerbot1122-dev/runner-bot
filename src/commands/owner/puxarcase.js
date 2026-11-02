const ownerOnly = require("../../utils/ownerOnly");
const { getTarget } = require("../../utils/checkTarget");
const resolveUser = require("../../utils/resolveUser");

module.exports = {
    name: ["puxarcase", "puxarjid"],
    description: "Converte LID em JID ou resolve o número de um usuário",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const target = getTarget(ctx);
        if (!target) {
            return ctx.replyNYX(`❌ Marque ou responda à mensagem de alguém.`, "user");
        }

        try {
            const realJid = await resolveUser(ctx.sock, ctx.chat, target);
            
            if (realJid === target && target.endsWith("@lid")) {
                return ctx.replyNYX("⚠️ Não foi possível converter o LID para um número de telefone real.", "bot");
            }

            return ctx.replyNYX({
                text: `🔍 *Case Puxado:*\n\nDe: \`${target}\`\nPara: \`${realJid}\``,
                mentions: [realJid]
            }, "user");
        } catch (e) {
            return ctx.replyNYX("❌ Não consegui puxar o case.", "bot");
        }
    }
};