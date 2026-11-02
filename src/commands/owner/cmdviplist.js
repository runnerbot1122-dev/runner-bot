const { requireOwner } = require("../../utils/checkPermission");
const { listVipCommands } = require("../../database/vipCommands");

module.exports = {
    name: "cmdviplist",
    description: "Lista os comandos exclusivos para VIPs",
    execute: async ctx => {
        requireOwner(ctx);
        try {
            const names = listVipCommands();
            return ctx.replyNYX(names.length
                ? `💎 Comandos exclusivos VIP:\n${names.map(name => `• ${name}`).join("\n")}`
                : "ℹ️ Nenhum comando foi marcado como exclusivo VIP.", "bot");
        } catch (error) {
            console.error("Erro ao listar comandos VIP:", error);
            return ctx.replyNYX("❌ Não foi possível ler a lista de comandos VIP.", "bot");
        }
    }
};
