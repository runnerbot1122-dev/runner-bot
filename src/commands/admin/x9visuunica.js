// src/commands/admin/x9visuunica.js
const { getSetting, setSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
  name: "x9visuunica",
  description: "Ativa/desativa captura de visualização única",
  category: "admin",
  adminOnly: true,
  async execute(ctx) {
    const { chat, args, isAdmin } = ctx;

    if (!isAdmin) {
      return replyNYX(ctx, "❌ Apenas administradores podem usar este comando.", "user");
    }

    const acao = (args[0] || "").toLowerCase();

    if (!["on", "off"].includes(acao)) {
      const atual = getSetting(chat, "x9VisuUnica") ? "✅ ATIVADO" : "❌ DESATIVADO";
      return replyNYX(
        ctx,
        `📌 *X9 VISU ÚNICA*\n\nStatus: ${atual}\n\n⚠️ *Aviso técnico:* o WhatsApp/Meta bloqueia o download da mídia "ver uma vez" para bots na maioria dos casos. O comando ativa a tentativa de interceptação, mas o sucesso depende da versão da API.\n\nUse:\n• *x9visuunica on*\n• *x9visuunica off*`,
        "user"
      );
    }

    const ativo = acao === "on";
    setSetting(chat, "x9VisuUnica", ativo);

    return replyNYX(
      ctx,
      `✅ X9 Visualização Única ${ativo ? "ativado" : "desativado"}!\n\n` +
        (ativo
          ? "👁️ O bot tentará capturar mídias de visualização única."
          : "👁️ A tentativa de captura foi desligada."),
      "user"
    );
  },
};