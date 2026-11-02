const { requireOwner } = require("../../utils/checkPermission");
const { listVips } = require("../../database/vips");

async function reject(ctx, message, code) {
    await ctx.replyNYX(message, "bot");
    throw new Error(code);
}

module.exports = {
    name: "viplist",
    description: "Lista os usuários VIP locais",

    execute: async ctx => {
        requireOwner(ctx);
        try {
            const records = listVips();
            const message = records.length
                ? [
                    "📋 Lista VIP local:",
                    ...records.map(record => `• @${record.userId.split("@")[0]} — adicionado em ${record.addedAt}`)
                ].join("\n")
                : "ℹ️ A lista VIP está vazia.";
            return ctx.replyNYX({
                text: message,
                mentions: records.map(record => record.userId)
            }, "bot");
        } catch (error) {
            console.error("Erro ao listar VIPs:", error);
            return reject(ctx, "❌ Não foi possível ler a lista VIP.", "VIP_STORAGE_ERROR");
        }
    }
};
