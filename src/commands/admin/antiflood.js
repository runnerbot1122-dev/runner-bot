// src/commands/admin/antiflood.js
const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: "antiflood",
    description: "Ativa/desativa a proteção contra excesso de mensagens",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, args, isAdmin } = ctx;

        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores podem usar este comando.", "user");

        const acao = (args[0] || "").toLowerCase();

        if (!["on", "off"].includes(acao)) {
            const atual = getSetting(chat, "antiFlood") ? "✅ ATIVADO" : "❌ DESATIVADO";
            return replyNYX(
                ctx,
                `📌 *ANTI-FLOOD*\n\nStatus atual: ${atual}\n\nUse:\n• *antiflood on*\n• *antiflood off*`,
                "user"
            );
        }

        const ativo = acao === "on";
        setSetting(chat, "antiFlood", ativo);

        return replyNYX(
            ctx,
            `✅ Anti-Flood ${ativo ? "ativado" : "desativado"}!\n\n` +
            (ativo ? "🛡️ O bot agora apaga mensagens em excesso (8 mensagens em 5 segundos)." : "🛡️ A proteção foi desligada."),
            "user"
        );
    },
};