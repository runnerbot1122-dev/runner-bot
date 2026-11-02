const {
    requireAdmin
} = require("../../utils/checkPermission");

const {
    getTarget
} = require("../../utils/checkTarget");

const config = require("../../config/config");
const logger = require("../../utils/logger");

async function responderFalha(ctx, mensagem, codigo, usarReplyNYX = true) {
    if (usarReplyNYX) {
        await ctx.replyNYX(mensagem, "user");
    } else {
        await ctx.reply(mensagem);
    }
    // O runner transforma rejeições em reação de erro e não aplica a reação de sucesso.
    throw new Error(codigo);
}

function alvoValido(alvo) {
    return typeof alvo === "string" && /^[^@\s]+@(s\.whatsapp\.net|c\.us|lid)$/i.test(alvo.trim());
}

function remocaoConfirmada(resultado, alvo) {
    return Array.isArray(resultado) &&
        resultado.length === 1 &&
        resultado[0] !== null &&
        typeof resultado[0] === "object" &&
        resultado[0].status === "200" &&
        resultado[0].jid === alvo;
}

module.exports = {
    name: ["ban"],
    description: "Remove usuário do grupo",

    execute: async (ctx) => {
        requireAdmin(ctx);

        if (!ctx.isGroup) {
            return responderFalha(ctx, "❌ Apenas grupos.", "BAN_GROUP_ONLY", false);
        }

        const alvoRecebido = getTarget(ctx);
        const alvo = typeof alvoRecebido === "string" ? alvoRecebido.trim() : "";

        if (!alvo) {
            return responderFalha(
                ctx,
                "❌ Marque ou responda o usuário que deseja remover.",
                "BAN_TARGET_REQUIRED"
            );
        }

        if (!alvoValido(alvo)) {
            return responderFalha(
                ctx,
                "❌ O alvo informado não é um usuário válido.",
                "BAN_TARGET_INVALID"
            );
        }

        // =========================================================
        // 🛡️ CORREÇÃO DA PROTEÇÃO DO DONO
        // =========================================================
        const numeroAlvo = alvo.split("@")[0];
        const donoConfig = config.owner ? String(config.owner).split("@")[0] : "";
        const botNumero = ctx.sock.user.id.split(":")[0].split("@")[0];

        // Se o alvo for o próprio bot ou o dono configurado
        if (numeroAlvo === botNumero || numeroAlvo === donoConfig) {
            // Se quem está tentando banir for o próprio dono, avisa que não pode banir a si mesmo
            if (ctx.isOwner) {
                return responderFalha(
                    ctx,
                    "❌ Você não pode remover a si mesmo nem o bot.",
                    "BAN_TARGET_PROTECTED"
                );
            }
            // Se for um admin comum tentando banir o dono, barra
            return responderFalha(
                ctx,
                "❌ Não é possível remover o dono do bot ou o próprio bot.",
                "BAN_TARGET_PROTECTED"
            );
        }
        // =========================================================

        let resultado;
        try {
            resultado = await ctx.sock.groupParticipantsUpdate(
                ctx.chat,
                [alvo],
                "remove"
            );
        } catch (e) {
            console.error("[BAN] Erro na API:", e);
            return responderFalha(
                ctx,
                "❌ Não foi possível confirmar se o membro foi removido. Verifique se o bot é admin.",
                "BAN_API_UNCONFIRMED"
            );
        }

        // O WhatsApp às vezes demora um pouco para confirmar a remoção, então verificamos o status
        if (!remocaoConfirmada(resultado, alvo)) {
            return responderFalha(
                ctx,
                "❌ A plataforma não confirmou a remoção. Verifique o estado do membro no grupo.",
                "BAN_RESULT_UNCONFIRMED"
            );
        }

        try {
            await logger.action(
                ctx.sock,
                {
                    acao: "☠️ BAN",
                    executor: ctx.sender,
                    alvo,
                    grupo: ctx.chat
                }
            );
        } catch {
            console.error("Falha ao registrar uma remoção confirmada.");
        }

        try {
            await ctx.replyNYX(
                {
                    text: "✅ @" + alvo.split("@")[0] + " foi removido do grupo com sucesso.",
                    mentions: [alvo]
                },
                "user"
            );
        } catch {
            console.error("Falha ao enviar a confirmação de uma remoção concluída.");
        }
    }
};