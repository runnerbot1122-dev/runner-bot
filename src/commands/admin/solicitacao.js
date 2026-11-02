// src/commands/admin/solicitacao.js
const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: "solicitacao",
    description: "Ativa/desativa a aprovação de entrada no grupo",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, args, isAdmin } = ctx;

        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores podem usar este comando.", "user");

        const acao = (args[0] || "").toLowerCase();

        if (!["on", "off"].includes(acao)) {
            const atual = getSetting(chat, "aprovacaoEntrada") ? "✅ ATIVADO" : "❌ DESATIVADO";
            return replyNYX(
                ctx,
                `📌 *APROVAÇÃO DE ENTRADA*\n\nStatus atual: ${atual}\n\nUse:\n• *solicitacao on*\n• *solicitacao off*\n\n_Com essa opção ativa, o bot vai guardar o pedido de quem tentar entrar e você poderá usar *aceitar* ou *recusar*._`,
                "user"
            );
        }

        const ativo = acao === "on";
        setSetting(chat, "aprovacaoEntrada", ativo);

        return replyNYX(
            ctx,
            `✅ Aprovação de entrada ${ativo ? "ativada" : "desativada"}!` +
            (ativo ? "\n\nO bot agora segurará os pedidos. Use *aceitar @membro* ou *recusar @membro*." : ""),
            "user"
        );
    },
};