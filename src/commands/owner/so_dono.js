const ownerOnly = require("../../utils/ownerOnly");
const security = require("../../database/securityGroups");

module.exports = {
    name: ["so_dono", "sodono", "so-dono"],
    description: "Ativa/desativa o modo restrito (apenas dono pode usar comandos)",
    execute: async (ctx) => {
        ownerOnly(ctx);

        if (!ctx.isGroup) {
            return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        }

        // Verifica o status atual. Se não existir, começa como falso.
        const statusAtual = security.isSoDonoEnabled(ctx.chat);
        const novoStatus = !statusAtual;

        security.setSoDono(ctx.chat, novoStatus);

        return ctx.replyNYX(
            novoStatus 
                ? "🔒 *Modo restrito ATIVADO!*\nApenas o Dono e o Mestre podem usar comandos neste grupo." 
                : "🔓 *Modo restrito DESATIVADO!*\nTodos os membros podem usar comandos novamente.",
            "bot"
        );
    }
};