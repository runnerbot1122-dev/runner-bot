// src/commands/admin/odelete.js
const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
  name: "odelete",
  description: "Ativa/desativa exclusão automática de mensagens",
  category: "admin",
  adminOnly: true,
  async execute(ctx) {
    const { chat, args, isAdmin } = ctx;

    if (!isAdmin) {
      return replyNYX(ctx, "❌ Apenas administradores podem usar este comando.", "user");
    }

    const acao = (args[0] || "").toLowerCase();

    if (!["on", "off"].includes(acao)) {
      const atual = getSetting(chat, "oDelete") ? "✅ ATIVADO" : "❌ DESATIVADO";
      return replyNYX(
        ctx,
        `📌 *O-DELETE*\n\nStatus: ${atual}\n\nComandos usados pelos admins serão apagados automaticamente.\n\nUse:\n• *odelete on*\n• *odelete off*`,
        "user"
      );
    }

    const ativo = acao === "on";
    setSetting(chat, "oDelete", ativo);

    return replyNYX(
      ctx,
      `✅ O-delete ${ativo ? "ativado" : "desativado"}!\n\n` +
        (ativo
          ? "🗑️ Mensagens de comando serão apagadas automaticamente."
          : "🗑️ A exclusão automática foi desligada."),
      "user"
    );
  },
};