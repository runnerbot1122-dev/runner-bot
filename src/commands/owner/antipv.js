const ownerOnly = require("../../utils/ownerOnly");
const security = require("../../database/securityGroups");
module.exports = { name: ["antipv"], description: "Avisar sobre uso do bot no privado", execute: async (ctx) => {
  ownerOnly(ctx);
  const current = security.getAntiPvLevel();
  const next = current === 1 ? 0 : 1;
  security.setAntiPvLevel(next);
  const labels = {0:"desativada",1:"nível 1 — aviso",2:"nível 2 — bloqueio de comandos",3:"nível 3 — bloqueio de mensagens privadas"};
  await ctx.replyNYX(`🛡️ Proteção anti-PV: ${labels[next]}.`, "bot");
} };
