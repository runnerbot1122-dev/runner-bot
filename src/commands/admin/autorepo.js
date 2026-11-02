// src/commands/admin/autorepo.js
const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
  name: "autorepo",
  description: "Ativa/desativa auto-reply em mídias recebidas",
  category: "admin",
  adminOnly: true,
  async execute(ctx) {
    const { chat, args, isAdmin } = ctx;

    if (!isAdmin) {
      return replyNYX(ctx, "❌ Apenas administradores podem usar este comando.", "user");
    }

    const acao = (args[0] || "").toLowerCase();

    if (!["1", "0"].includes(acao)) {
      const atual = getSetting(chat, "autoRepo") ? "✅ ATIVADO" : "❌ DESATIVADO";
      return replyNYX(
        ctx,
        `📌 *AUTO-REPO*\n\nStatus atual: ${atual}\n\nUse:\n• *autorepo 1*\n• *autorepo 0*`,
        "user"
      );
    }

    const ativo = acao === "1";
    setSetting(chat, "autoRepo", ativo);

    return replyNYX(
      ctx,
      `✅ Auto-repo ${ativo ? "ativado" : "desativado"} com sucesso!\n\n` +
        (ativo
          ? "📎 A partir de agora, o bot responderá automaticamente mídias usando as legendas configuradas (legenda_imagem / legenda_video / legenda_documento)."
          : "📎 O auto-reply em mídias foi desligado."),
      "user"
    );
  },
};