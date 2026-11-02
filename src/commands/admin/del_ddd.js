// src/commands/admin/del_ddd.js
const { delDDD } = require("../../utils/ddd");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: "del_ddd",
    description: "Remove um DDD da lista de bloqueio do grupo",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, args, isAdmin } = ctx;

        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores.", "user");

        const ddd = args[0];
        if (!ddd) {
            return replyNYX(ctx, "❌ Informe o DDD que deseja remover. Ex: *del_ddd 11*", "user");
        }

        const resultado = delDDD(chat, ddd);
        if (!resultado.ok) {
            return replyNYX(ctx, `❌ ${resultado.msg}`, "user");
        }

        return replyNYX(ctx, `✅ ${resultado.msg}`, "user");
    },
};