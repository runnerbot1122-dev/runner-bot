// src/commands/admin/add_ddd.js
const { getSetting, setSetting } = require("../../utils/groups");
const { addDDD } = require("../../utils/ddd");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: "add_ddd",
    description: "Adiciona um DDD à lista de bloqueio do grupo",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, args, isAdmin } = ctx;

        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores.", "user");

        const ddd = args[0];
        if (!ddd) {
            return replyNYX(ctx, "❌ Informe o DDD que deseja bloquear. Ex: *add_ddd 11*", "user");
        }

        // Ativa a proteção automaticamente se estiver desligada
        if (getSetting(chat, "antiDdd") !== true) {
            setSetting(chat, "antiDdd", true);
        }

        const resultado = addDDD(chat, ddd);
        if (!resultado.ok) {
            return replyNYX(ctx, `❌ ${resultado.msg}`, "user");
        }

        return replyNYX(ctx, `✅ ${resultado.msg}\n\n_A proteção *antiDdd* foi ativada automaticamente._`, "user");
    },
};