const { requireOwner } = require("../../utils/checkPermission");
const { addVipCommand, normalizeCommandName } = require("../../database/vipCommands");
const commands = require("../../core/loader");

module.exports = {
    name: "addcmdvip",
    description: "Marca um comando como exclusivo para VIPs",
    execute: async ctx => {
        requireOwner(ctx);
        const input = Array.isArray(ctx.args) && ctx.args.length === 1 ? String(ctx.args[0] || "").trim() : "";
        if (!input) return ctx.replyNYX("⚠️ Informe o comando sem prefixo. Exemplo: addcmdvip fig", "bot");
        let name;
        try { name = normalizeCommandName(input); }
        catch (_) { return ctx.replyNYX("❌ Nome de comando inválido. Use apenas letras, números, hífen ou underline.", "bot"); }
        if (!commands.has(name)) return ctx.replyNYX(`❌ O comando "${name}" não está registrado.`, "bot");
        try {
            const result = addVipCommand(name);
            return ctx.replyNYX(result.alreadyPresent
                ? `ℹ️ O comando ${name} já estava marcado como exclusivo VIP.`
                : `💎 O comando ${name} agora é exclusivo para VIPs.`, "bot");
        } catch (error) {
            console.error("Erro ao marcar comando VIP:", error);
            return ctx.replyNYX("❌ Não foi possível salvar a lista de comandos VIP.", "bot");
        }
    }
};
