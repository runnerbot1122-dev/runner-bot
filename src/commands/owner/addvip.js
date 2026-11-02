const { requireOwner } = require("../../utils/checkPermission");
const { addVip } = require("../../database/vips");
const { resolveVipTarget } = require("../../utils/vipTarget");

async function reject(ctx, message, code) {
    await ctx.replyNYX(message, "bot");
    throw new Error(code);
}

module.exports = {
    name: "addvip",
    description: "Adiciona um usuário à lista VIP local",

    execute: async ctx => {
        requireOwner(ctx);
        const target = await resolveVipTarget(ctx);
        if (!target) {
            return reject(ctx, "⚠️ Marque, responda ou informe o JID do usuário VIP.", "VIP_TARGET_REQUIRED");
        }

        try {
            const record = addVip(target);
            if (record.alreadyPresent) {
                return ctx.replyNYX({
                    text: `ℹ️ @${target.split("@")[0]} já está na lista VIP.`,
                    mentions: [target]
                }, "bot");
            }
            return ctx.replyNYX({
                text: `✅ @${target.split("@")[0]} foi adicionado à lista VIP.`,
                mentions: [target]
            }, "bot");
        } catch (error) {
            console.error("Erro ao adicionar VIP:", error);
            return reject(ctx, "❌ Não foi possível salvar a lista VIP.", "VIP_STORAGE_ERROR");
        }
    }
};
