const { delay } = require("@whiskeysockets/baileys");
const logger = require("./logger");

async function deletePaymentMessage({ socket, remoteJid, messageKey, settleMs = 400 }) {
    const id = messageKey?.id;
    const participant = messageKey?.participant;

    if (!id || !participant) {
        throw new Error("Não foi possível identificar a mensagem de pagamento para apagar!");
    }

    try {
        // 1. Mensagem auxiliar para ancorar o edit
        const dummyMessage = await socket.sendMessage(remoteJid, { text: "​" });
        const dummyMessageId = dummyMessage?.key?.id;

        if (!dummyMessageId) throw new Error("Falha ao gerar ID auxiliar");

        // 2. Força a "edição" do cartão de pagamento com o mesmo ID
        await socket.sendMessage(
            remoteJid,
            {
                text: "🚫 Mensagem de pagamento removida!",
                edit: { remoteJid, fromMe: true, id: dummyMessageId },
            },
            { messageId: id } // 👈 A mágica está aqui
        );

        await delay(settleMs);

        // 3. Tenta apagar a mensagem original
        await socket.sendMessage(remoteJid, {
            delete: { remoteJid, id, fromMe: false, participant },
        });

        await delay(settleMs);

        // 4. Limpa a mensagem dummy (a invisível)
        try {
            await socket.sendMessage(remoteJid, {
                delete: { remoteJid, id: dummyMessageId, fromMe: true },
            });
        } catch (_) {
            try {
                await socket.sendMessage(remoteJid, {
                    delete: { remoteJid, id: dummyMessageId, fromMe: false, participant: socket.user?.id },
                });
            } catch (cleanupError) {
                logger.error(`[payment-delete] Falha ao apagar dummy: ${cleanupError.message}`);
            }
        }
    } catch (error) {
        logger.error(`[payment-delete] Erro ao apagar pagamento: ${error.message}`);
        throw new Error("Não foi possível apagar a mensagem de pagamento!");
    }
}

async function deletePaymentMessageWithFallback({ socket, remoteJid, messageKey, settleMs = 400 }) {
    try {
        await deletePaymentMessage({ socket, remoteJid, messageKey, settleMs });
    } catch (error) {
        logger.error(`[payment-delete] Fallback para revoke normal: ${error.message}`);
        
        // Se a edição falhar, tenta o delete padrão
        await socket.sendMessage(remoteJid, {
            delete: {
                remoteJid: messageKey?.remoteJid || remoteJid,
                fromMe: messageKey?.fromMe ?? false,
                id: messageKey?.id,
                participant: messageKey?.participant,
            },
        });
    }
}

module.exports = { deletePaymentMessage, deletePaymentMessageWithFallback };