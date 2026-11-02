const ownerOnly = require("../../utils/ownerOnly");
const { addGlobalReactionKeyword } = require("../../utils/groups");

module.exports = {
    name: "addrc",
    description: "Cadastra uma reação automática global (em todos os grupos)",
    execute: async (ctx) => {
        ownerOnly(ctx);

        // Junta todos os argumentos: ["runner", "|", "👑"] vira "runner | 👑"
        const raw = ctx.args.join(" ").trim();

        if (!raw || !raw.includes("|")) {
            return ctx.replyNYX(
                `⚙️ Uso:\n\n7addrc <gatilho> | <emoji>\n\nExemplos:\n7addrc runner | 👑\n7addrc bom dia | ❤️`,
                "user"
            );
        }

        const partes = raw.split("|");
        const trigger = partes[0].trim();
        const emoji = partes[1].trim();

        if (!trigger || !emoji) {
            return ctx.replyNYX(`⚙️ Uso:\n\n7addrc <gatilho> | <emoji>`, "user");
        }

        addGlobalReactionKeyword(trigger, emoji);

        return ctx.replyNYX(
            `✅ Reação global cadastrada.\n\n"${trigger}" → ${emoji}`,
            "bot"
        );
    }
};