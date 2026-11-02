const { requireOwner } = require("../../utils/checkPermission");
const { removeVipCommand, normalizeCommandName } = require("../../database/vipCommands");

module.exports = {
    name: "delcmdvip",
    description: "Remove a exclusividade VIP de um comando",
    execute: async ctx => {
        requireOwner(ctx);
        const input = Array.isArray(ctx.args) && ctx.args.length === 1 ? String(ctx.args[0] || "").trim() : "";
        if (!input) return ctx.replyNYX("⚠️ Informe o comando sem prefixo. Exemplo: delcmdvip fig", "bot");
        let removed;
        try { normalizeCommandName(input); removed = removeVipCommand(input); }
        catch (error) {
            if (error && error.message === "VIP_COMMAND_NAME_INVALID") return ctx.replyNYX("❌ Nome de comando inválido.", "bot");
            console.error("Erro ao remover comando VIP:", error);
            return ctx.replyNYX("❌ Não foi possível atualizar a lista de comandos VIP.", "bot");
        }
        return ctx.replyNYX(removed
            ? `✅ O comando ${input.trim().toLowerCase()} deixou de ser exclusivo VIP.`
            : `ℹ️ O comando ${input.trim().toLowerCase()} não estava marcado como VIP.`, "bot");
    }
};
