const ownerOnly = require("../../utils/ownerOnly");
const { proto, generateWAMessageFromContent } = require("@whiskeysockets/baileys");

module.exports = {
    name: ["testepaymentnative", "testepayment", "testepaynative"],
    description: "Testa o cartão nativo de pagamento do WhatsApp com valor zero",
    execute: async ctx => {
        ownerOnly(ctx);

        try {
            const requestPaymentMessage = proto.Message.RequestPaymentMessage.create({
                amount1000: 0,
                currencyCodeIso4217: "BRL",
                requestFrom: ctx.sender,
                noteMessage: proto.Message.create({
                    conversation: "Pedido de teste do Runner Bot"
                })
            });

            const mensagem = generateWAMessageFromContent(ctx.chat, {
                requestPaymentMessage
            }, {
                userJid: ctx.sock.user.id,
                quoted: ctx.message
            });

            await ctx.sock.relayMessage(ctx.chat, mensagem.message, {
                messageId: mensagem.key.id
            });

            console.log("[TESTE-PAYMENT-NATIVE] RequestPaymentMessage de R$ 0,00 enviado.");
        } catch (error) {
            console.error("[TESTE-PAYMENT-NATIVE] Erro:", error.stack || error.message);
            return ctx.replyNYX(
                `❌ O WhatsApp/Baileys não aceitou o cartão nativo de pagamento.\n\nErro: ${error.message}`,
                "bot"
            );
        }
    }
};