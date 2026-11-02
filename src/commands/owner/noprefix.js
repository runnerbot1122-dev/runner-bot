const ownerOnly = require("../../utils/ownerOnly");
const security = require("../../database/securityGroups");

module.exports = {
    name: ["noprefix", "noprefixo"],
    description: "Autoriza um comando a rodar sem prefixo neste grupo",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use no grupo.", "bot");

        const comandoAlvo = ctx.args[0]?.toLowerCase();
        
        if (!comandoAlvo) {
            const lista = security.getNoPrefixList(ctx.chat);
            return ctx.replyNYX(`⚡ *No-Prefix Ativo para:*\n${lista.length > 0 ? lista.map(c => `- ${c}`).join("\n") : "Nenhum"}\n\nUse: ${ctx.prefix}noprefix <comando> para adicionar/remover.`, "user");
        }

        const lista = security.getNoPrefixList(ctx.chat);
        const jaExiste = lista.includes(comandoAlvo);

        if (jaExiste) {
            security.removeNoPrefix(ctx.chat, comandoAlvo);
            return ctx.replyNYX(`🔒 O comando *${comandoAlvo}* voltou a exigir prefixo.`, "user");
        } else {
            security.addNoPrefix(ctx.chat, comandoAlvo);
            return ctx.replyNYX(`⚡ O comando *${comandoAlvo}* agora pode ser usado sem prefixo neste grupo.`, "user");
        }
    }
};