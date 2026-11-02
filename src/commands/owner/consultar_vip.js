const { requireOwner } = require("../../utils/checkPermission");
const { getVip } = require("../../database/vips");
const { resolveVipTarget } = require("../../utils/vipTarget");

async function reject(ctx, message, code) {
    await ctx.replyNYX(message, "bot");
    throw new Error(code);
}

module.exports = {
    name: "consultar_vip",
    description: "Consulta o status VIP de um usuário",

    execute: async ctx => {
        requireOwner(ctx);
        const target = await resolveVipTarget(ctx, { fallbackSender: true });
        if (!target) {
            return reject(ctx, "⚠️ Marque, responda ou informe o JID do usuário.", "VIP_TARGET_REQUIRED");
        }

        try {
            const record = getVip(target);
            return ctx.replyNYX({
                text: record
                    ? `✅ @${target.split("@")[0]} está na lista VIP desde ${record.addedAt}.`
                    : `ℹ️ @${target.split("@")[0]} não está na lista VIP.`,
                mentions: [target]
            }, "bot");
        } catch (error) {
            console.error("Erro ao consultar VIP:", error);
            return reject(ctx, "❌ Não foi possível ler a lista VIP.", "VIP_STORAGE_ERROR");
        }
    }
};
