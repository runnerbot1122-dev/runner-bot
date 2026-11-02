// src/commands/admin/autototext.js
const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
  name: "autototext",
  description: "Transcreve áudios automaticamente (requer API)",
  category: "admin",
  adminOnly: true,
  async execute(ctx) {
    const { chat, args, isAdmin } = ctx;

    if (!isAdmin) {
      return replyNYX(ctx, "❌ Apenas administradores podem usar este comando.", "user");
    }

    const acao = (args[0] || "").toLowerCase();

    if (!["on", "off"].includes(acao)) {
      const atual = getSetting(chat, "autoToText") ? "✅ ATIVADO" : "❌ DESATIVADO";
      const apiOk = !!process.env.WHISPER_API_URL;
      return replyNYX(
        ctx,
        `📌 *AUTO-TOTEXT*\n\nStatus: ${atual}\nAPI configurada: ${apiOk ? "✅" : "❌"}\n\nUse:\n• *autototext on*\n• *autototext off*\n\n⚠️ Requer WHISPER_API_URL no .env`,
        "user"
      );
    }

    if (acao === "on" && !process.env.WHISPER_API_URL) {
      return replyNYX(
        ctx,
        "❌ Não posso ativar: a variável *WHISPER_API_URL* não está configurada no .env.\n\nAdicione e reinicie o bot.",
        "user"
      );
    }

    const ativo = acao === "on";
    setSetting(chat, "autoToText", ativo);

    return replyNYX(
      ctx,
      `✅ Auto-to-text ${ativo ? "ativado" : "desativado"}!\n\n` +
        (ativo
          ? "🎙️ Áudios recebidos serão transcritos automaticamente."
          : "🎙️ A transcrição automática foi desligada."),
      "user"
    );
  },
};