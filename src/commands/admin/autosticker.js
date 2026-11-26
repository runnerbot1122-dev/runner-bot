// src/commands/admin/autosticker.js
const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
  name: "autosticker",
  description: "Converte imagens/vídeos automaticamente em figurinhas (vídeos podem manter o som)",
  category: "admin",
  adminOnly: true,
  async execute(ctx) {
    const { chat, args, isAdmin } = ctx;

    if (!isAdmin) {
      return replyNYX(ctx, "❌ Apenas administradores podem usar este comando.", "user");
    }

    const acao = (args[0] || "").toLowerCase();

    if (!["1", "0"].includes(acao)) {
      const atual = getSetting(chat, "autoSticker") ? "✅ ATIVADO" : "❌ DESATIVADO";
      return replyNYX(
        ctx,
        `📌 *AUTO-STICKER*\n\nStatus atual: ${atual}\n\nUse:\n• *autosticker 1*\n• *autosticker 0*`,
        "user"
      );
    }

    const ativo = acao === "1";
    setSetting(chat, "autoSticker", ativo);

    return replyNYX(
      ctx,
      `✅ Auto-sticker ${ativo ? "ativado" : "desativado"}!\n\n` +
        (ativo
          ? "🎨 Imagens e vídeos enviados no grupo serão convertidos automaticamente em figurinhas; vídeos com áudio podem manter o som."
          : "🎨 A conversão automática foi desligada."),
      "user"
    );
  },
};
