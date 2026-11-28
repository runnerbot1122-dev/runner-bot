const { requireAdmin } = require("../../utils/checkPermission");
const { setAutoReplyOptions } = require("../../utils/groups");

function parseCooldown(valor) {
    const texto = String(valor || "").trim().toLowerCase();
    if (["0", "off", "desativado", "sem"].includes(texto)) return 0;
    const match = texto.match(/^(\d+)(s|m|h)$/);
    if (!match) return null;
    const multiplicadores = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000 };
    const ms = Number(match[1]) * multiplicadores[match[2]];
    return Number.isSafeInteger(ms) && ms <= 24 * 60 * 60 * 1000 ? ms : null;
}

function formatCooldown(ms) {
    if (!ms) return "desativado";
    const segundos = Math.round(ms / 1000);
    if (segundos < 60) return `${segundos}s`;
    const minutos = Math.round(segundos / 60);
    if (minutos < 60) return `${minutos}m`;
    return `${Math.round(minutos / 60)}h`;
}

module.exports = {
    name: ["configresposta", "configurarresposta"],
    description: "Configura prioridade e cooldown de uma resposta automática",
    category: "admin",
    async execute(ctx) {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Este comando só pode ser usado em grupos.", "bot");
        const partes = (ctx.args || []).join(" ").split("|").map(item => item.trim());
        if (partes.length !== 3 || !partes[0] || !/^[-+]?\d+$/.test(partes[1])) {
            return ctx.replyNYX(
                `⚙️ Uso: *${ctx.prefix}configresposta <gatilho> | <prioridade> | <cooldown>*\nExemplo: *${ctx.prefix}configresposta bom dia | 10 | 30s*\nPrioridade: -100 a 100. Cooldown: 0, 10s, 5m ou 1h.`,
                "bot"
            );
        }
        const priority = Number(partes[1]);
        const cooldownMs = parseCooldown(partes[2]);
        if (priority < -100 || priority > 100 || cooldownMs === null) {
            return ctx.replyNYX("❌ Prioridade deve ficar entre -100 e 100; cooldown deve ser 0 ou ter no máximo 24 horas.", "bot");
        }
        const resposta = setAutoReplyOptions(ctx.chat, partes[0], { priority, cooldownMs });
        if (!resposta) return ctx.replyNYX("❌ Resposta automática não encontrada ou configuração inválida.", "bot");
        return ctx.replyNYX(
            `✅ Configuração atualizada:\n*${resposta.trigger}*\nPrioridade: *${priority}*\nCooldown: *${formatCooldown(cooldownMs)}*`,
            "bot"
        );
    }
};
