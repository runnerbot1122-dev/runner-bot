const { requireOwner } = require("../../utils/checkPermission");
const { removeVip } = require("../../database/vips");
const { resolveVipTarget } = require("../../utils/vipTarget");

async function reject(ctx, message, code) {
    await ctx.replyNYX(message, "bot");
    throw new Error(code);
}

module.exports = {
    name: "delvip",
    description: "Remove um usuário da lista VIP local",

    execute: async ctx => {
        requireOwner(ctx);
        const target = await resolveVipTarget(ctx);
        if (!target) {
            return reject(ctx, "⚠️ Marque, responda ou informe o JID do usuário VIP.", "VIP_TARGET_REQUIRED");
        }

        try {
            const removed = removeVip(target);
            return ctx.replyNYX({
                text: removed
                    ? `✅ @${target.split("@")[0]} foi removido da lista VIP.`
                    : `ℹ️ @${target.split("@")[0]} não está na lista VIP.`,
                mentions: [target]
            }, "bot");
        } catch (error) {
            console.error("Erro ao remover VIP:", error);
            return reject(ctx, "❌ Não foi possível salvar a lista VIP.", "VIP_STORAGE_ERROR");
        }
    }
};
