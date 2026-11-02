const ownerOnly = require("../../utils/ownerOnly");
const { removeGlobalReactionKeyword } = require("../../utils/groups");

module.exports = {
    name: ["delrc", "delreacao", "delreacoes"],
    description: "Remove uma reação automática global",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const trigger = ctx.args.join(" ").trim();

        if (!trigger) {
            return ctx.replyNYX(
                `⚙️ Uso:\n\n7delrc <gatilho>\n\nExemplo:\n7delrc EZ`,
                "bot"
            );
        }

        const removido = removeGlobalReactionKeyword(trigger);

        if (!removido) {
            return ctx.replyNYX(`❌ Gatilho não encontrado:\n${trigger}`, "bot");
        }

        return ctx.replyNYX(`✅ Gatilho global removido:\n${trigger}`, "bot");
    }
};