const ownerOnly = require("../../utils/ownerOnly");
const security = require("../../database/securityGroups");
module.exports = { name: ["antipv3"], description: "Bloquear mensagens privadas de não donos", execute: async (ctx) => {
  ownerOnly(ctx);
  const current = security.getAntiPvLevel();
  const next = current === 3 ? 0 : 3;
  security.setAntiPvLevel(next);
  const labels = {0:"desativada",1:"nível 1 — aviso",2:"nível 2 — bloqueio de comandos",3:"nível 3 — bloqueio de mensagens privadas"};
  await ctx.replyNYX(`🛡️ Proteção anti-PV: ${labels[next]}.`, "bot");
} };
