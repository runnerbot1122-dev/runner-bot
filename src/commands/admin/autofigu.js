// src/commands/admin/autofigu.js
const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
  name: "autofigu",
  description: "Reenvia figurinhas recebidas com a legenda configurada",
  category: "admin",
  adminOnly: true,
  async execute(ctx) {
    const { chat, args, isAdmin } = ctx;

    if (!isAdmin) {
      return replyNYX(ctx, "❌ Apenas administradores podem usar este comando.", "user");
    }

    const acao = (args[0] || "").toLowerCase();

    if (!["1", "0"].includes(acao)) {
      const atual = getSetting(chat, "autoFigu") ? "✅ ATIVADO" : "❌ DESATIVADO";
      return replyNYX(
        ctx,
        `📌 *AUTO-FIGU*\n\nStatus atual: ${atual}\n\nUse:\n• *autofigu 1*\n• *autofigu 0*`,
        "user"
      );
    }

    const ativo = acao === "1";
    setSetting(chat, "autoFigu", ativo);

    return replyNYX(
      ctx,
      `✅ Auto-figu ${ativo ? "ativado" : "desativado"}!\n\n` +
        (ativo
          ? "🖼️ Figurinhas enviadas serão reconhecidas e reenviadas com a legenda padrão."
          : "🖼️ O reconhecimento automático foi desligado."),
      "user"
    );
  },
};