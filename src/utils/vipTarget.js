const { getTarget } = require("./checkTarget");
const resolveUser = require("./resolveUser");

async function resolveVipTarget(ctx, { fallbackSender = false } = {}) {
    const explicit = Array.isArray(ctx.args) && ctx.args.length === 1
        ? String(ctx.args[0] || "").trim()
        : "";
    const target = getTarget(ctx) || explicit || (fallbackSender ? ctx.sender : null);
    if (!target) {
        return null;
    }

    try {
        return await resolveUser(ctx.sock, ctx.chat, target);
    } catch (_) {
        return target;
    }
}

module.exports = { resolveVipTarget };
