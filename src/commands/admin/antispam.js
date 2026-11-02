// src/commands/admin/antispam.js
const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: "antispam",
    description: "Ativa/desativa a proteção contra mensagens repetidas",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, args, isAdmin } = ctx;

        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores podem usar este comando.", "user");

        const acao = (args[0] || "").toLowerCase();

        if (!["1", "0"].includes(acao)) {
            const atual = getSetting(chat, "antiSpam") ? "✅ ATIVADO" : "❌ DESATIVADO";
            return replyNYX(
                ctx,
                `📌 *ANTI-SPAM*\n\nStatus atual: ${atual}\n\nUse:\n• *antispam 1*\n• *antispam 0*`,
                "user"
            );
        }

        const ativo = acao === "1";
        setSetting(chat, "antiSpam", ativo);

        return replyNYX(
            ctx,
            `✅ Anti-Spam ${ativo ? "ativado" : "desativado"}!\n\n` +
            (ativo ? "🛡️ O bot agora apaga mensagens repetidas (3 vezes seguidas em 3 segundos)." : "🛡️ A proteção foi desligada."),
            "user"
        );
    },
};