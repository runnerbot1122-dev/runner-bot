const {
    requireAdmin
} = require("../../utils/checkPermission");

const {
    podePunir,
    getTarget
} = require("../../utils/checkTarget");

const logger = require("../../utils/logger");

function alvoValido(alvo) {
    return typeof alvo === "string" &&
        /@(s\.whatsapp\.net|c\.us|lid)$/.test(alvo.trim());
}

async function responderFalha(ctx, mensagem, codigo, usarReplyNYX = true) {
    if (usarReplyNYX) {
        await ctx.replyNYX(mensagem, "user");
    } else {
        await ctx.reply(mensagem);
    }

    throw new Error(codigo);
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
    name: ["kick"],
    description: "Remove usuário do grupo",

    execute: async (ctx) => {
        requireAdmin(ctx);

        if (!ctx.isGroup) {
            return responderFalha(
                ctx,
                "❌ Apenas grupos.",
                "KICK_GROUP_ONLY",
                false
            );
        }

        const alvoRecebido = getTarget(ctx);
        const alvo = typeof alvoRecebido === "string"
            ? alvoRecebido.trim()
            : "";

        if (!alvo) {
            return responderFalha(
                ctx,
                "❌ Marque ou responda o usuário que deseja remover.",
                "KICK_TARGET_REQUIRED"
            );
        }

        if (!alvoValido(alvo)) {
            return responderFalha(
                ctx,
                "❌ O alvo informado não é um usuário válido.",
                "KICK_TARGET_INVALID"
            );
        }

        const permissao = podePunir(ctx, alvo);
        if (!permissao || permissao.permitido !== true) {
            return responderFalha(
                ctx,
                "❌ Não posso remover o dono do bot nem o próprio bot.",
                "KICK_TARGET_PROTECTED"
            );
        }

        let resultado;
        try {
            resultado = await ctx.sock.groupParticipantsUpdate(
                ctx.chat,
                [alvo],
                "remove"
            );
        } catch {
            return responderFalha(
                ctx,
                "❌ Não foi possível confirmar se o membro foi removido. Verifique o grupo.",
                "KICK_API_UNCONFIRMED"
            );
        }

        if (!remocaoConfirmada(resultado, alvo)) {
            return responderFalha(
                ctx,
                "❌ A plataforma não confirmou a remoção. Verifique o estado do membro no grupo.",
                "KICK_RESULT_UNCONFIRMED"
            );
        }

        try {
            await logger.action(
                ctx.sock,
                {
                    acao: "👢 KICK",
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
