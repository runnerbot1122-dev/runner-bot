const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["tagme", "mytag"],
    description: "Menciona o próprio usuário",

    execute: async ctx => {
        const numero = String(ctx.sender || "").split("@")[0];
        return replyNYX(ctx, {
            text: `📣 @${numero}`,
            mentions: [ctx.sender]
        }, "bot");
    }
};