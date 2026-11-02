const {
    podePunir,
    getTarget
} = require("../../utils/checkTarget");

const resolveUser = require("../../utils/resolveUser");
const logger = require("../../utils/logger");
const securityGroups = require("../../database/securityGroups");
const { verificarDonoDoGrupo } = require("../../utils/groupOwnerAccess");

const {
    encontrarParticipante,
    identidadesDoParticipante,
    resultadoConfirmado
} = require("../../utils/participantIdentity");

module.exports = {
    name: ["rebaixar", "demote"],
    description: "Remove administrador",

    execute: async (ctx) => {
        if (!ctx.isGroup) {
            return ctx.reply("❌ Apenas grupos.");
        }

        let antiArqvAtivo;

        try {
            antiArqvAtivo = securityGroups.isAntiArqvEnabled(ctx.chat);
        } catch (erro) {
            console.error("[REBAIXAR] Falha ao consultar Anti-Arqv:", erro?.message || erro);

            return ctx.replyNYX(
                "❌ Não consegui verificar a proteção deste grupo. Tente novamente.",
                "bot"
            );
        }

        if (antiArqvAtivo) {
            if (!ctx.isMaster && !ctx.isOwner) {
                const verificacao = await verificarDonoDoGrupo(
                    ctx.sock,
                    ctx.chat,
                    ctx.sender
                );

                if (!verificacao.autorizado) {
                    return ctx.replyNYX(
                        "❌ Com Anti-Arqv ativo, somente Master, Owner do bot ou dono registrado com 7donogp podem promover ou rebaixar administradores.",
                        "bot"
                    );
                }
            }
        } else if (!ctx.isAdmin && !ctx.isMaster && !ctx.isOwner) {
            return ctx.replyNYX(
                "❌ Apenas administradores do grupo podem rebaixar membros.",
                "bot"
            );
        }

        const alvo = getTarget(ctx);

        if (!alvo) {
            return ctx.reply("⚠️ Marque o usuário que deseja rebaixar.");
        }

        const alvoReal = await resolveUser(ctx.sock, ctx.chat, alvo);

        if (
            typeof alvoReal !== "string" ||
            alvoReal.toLowerCase().endsWith("@lid")
        ) {
            return ctx.replyNYX(
                "⚠️ Não consegui confirmar a identidade deste participante no grupo. Tente mencioná-lo novamente ou responder a uma mensagem dele.",
                "user"
            );
        }

        const protecao = podePunir(ctx, alvoReal);

        if (!protecao) {
            return ctx.reply("❌ Não posso alterar a permissão deste usuário.");
        }

        let identidadesAlvo = [alvoReal];

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.chat);
            const participante = encontrarParticipante(metadata, [alvoReal]);

            if (participante) {
                identidadesAlvo = identidadesDoParticipante(participante);
            }
        } catch (erroMetadata) {
            console.warn(
                "[REBAIXAR] Não foi possível consultar as identidades do alvo:",
                erroMetadata?.message || erroMetadata
            );
        }

        let resultado;

        try {
            resultado = await ctx.sock.groupParticipantsUpdate(
                ctx.chat,
                [alvoReal],
                "demote"
            );
        } catch (erro) {
            console.error("[REBAIXAR] Erro ao rebaixar usuário:", erro);

            return ctx.replyNYX(
                "❌ Não consegui remover o administrador.",
                "user"
            );
        }

        const confirmado = resultadoConfirmado(resultado, identidadesAlvo);

        if (!confirmado) {
            return ctx.replyNYX(
                "⚠️ A plataforma não confirmou a alteração para o participante solicitado. Verifique as permissões do grupo.",
                "user"
            );
        }

        await logger.action(ctx.sock, {
            acao: "⬇️ DEMOTE",
            executor: ctx.sender,
            alvo: alvoReal,
            grupo: ctx.chat
        });

        try {
            await ctx.replyNYX({
                text: `〘 @${alvoReal.split("@")[0]} 〙 ᴀᴅᴍ ʀᴇᴍᴏᴠɪᴅᴏ.\n\nᴏ ᴄᴀʀɢᴏ ᴅᴇ ᴀᴅᴍɪɴ ɴãᴏ ᴘᴇʀᴛᴇɴᴄᴇ ᴍᴀɪs ᴀ ᴠᴏᴄᴇ̂.`,
                mentions: [alvoReal]
            }, "user");
        } catch (erroEnvio) {
            console.error(
                "[REBAIXAR] Rebaixamento concluído, mas falhou o envio da confirmação:",
                erroEnvio
            );
        }
    }
};