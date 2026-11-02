const ownerOnly = require('../../utils/ownerOnly');
const security = require('../../database/securityGroups');

module.exports = {
  name: ['ativadms'],
  description: 'Mostra administradores e quantidade de comandos usados',
  execute: async (ctx) => {
    ownerOnly(ctx);
    if (!ctx.isGroup) return ctx.replyNYX('❌ Use em um grupo.', 'bot');

    let metadata;
    try {
      metadata = await ctx.sock.groupMetadata(ctx.chat);
    } catch (_) {
      return ctx.replyNYX('❌ Não consegui consultar os administradores.', 'bot');
    }

    let usage;
    try {
      usage = security.getAdminUsage(ctx.chat);
    } catch (_) {
      return ctx.replyNYX('❌ Não consegui consultar o registro de atividade.', 'bot');
    }

    const admins = (metadata.participants || []).filter(p => p.admin === 'admin' || p.admin === 'superadmin');
    const lines = admins.map((p, i) => {
      const ids = [p.id, p.jid, p.lid].filter(Boolean);
      const count = ids.reduce((n, id) => n || usage[id] || usage[String(id).replace(/:\d+@/, '@')] || 0, 0);
      const id = ids[0] || 'admin';
      const nome = String(p.name || p.notify || '').trim();
      const label = nome || `@${String(id).split('@')[0].split(':')[0]}`;
      return `${i + 1}. ${label} — ${count} comando(s)`;
    });

    return ctx.replyNYX(
      `📊 ATIVIDADE DOS ADMINS\n\n${lines.join('\n') || 'Nenhum administrador encontrado.'}\n\nA contagem começa após esta versão entrar em funcionamento; não inclui atividade histórica.`,
      'bot'
    );
  }
};
