const {
    requireAdmin
} = require("../../utils/checkPermission");

const {
    getTarget,
    podePunir
} = require("../../utils/checkTarget");

const config = require("../../config/config");
const logger = require("../../utils/logger");

async function responderFalha(ctx, mensagem, codigo, usarReplyNYX = true) {
    if (usarReplyNYX) {
        await ctx.replyNYX(mensagem, "user");
    } else {
        await ctx.reply(mensagem);
    }
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
        // 🛡️ PROTEÇÃO DO DONO / MESTRE (Usando a função oficial)
        // =========================================================
        const protecao = podePunir(ctx, alvo);
        if (!protecao.permitido) {
            let motivo = "❌ Não é possível remover este usuário.";
            if (protecao.motivo === "dono") motivo = "❌ Não é possível remover o Dono do bot.";
            if (protecao.motivo === "bot") motivo = "❌ Não é possível remover o próprio bot.";
            if (protecao.motivo === "subdono_ou_dono_grupo") motivo = "❌ Não é possível remover um Subdono ou Dono do grupo.";
            
            return responderFalha(ctx, motivo, "BAN_TARGET_PROTECTED");
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