const ownerOnly = require('../../utils/ownerOnly');
const paymentConfig = require('../../database/paymentConfig');

module.exports = {
    name: ['setpayment', 'pagamento', 'valorpagamento', 'valor-pagamento'],
    description: 'Configura o valor global exibido no cartão Anti-Arqv',
    execute: async (ctx) => {
        ownerOnly(ctx);
        const args = Array.isArray(ctx.args) ? ctx.args : [];

        if (args.length === 0) {
            try {
                const atual = paymentConfig.readCents();
                return ctx.replyNYX(`💰 Valor global do cartão: *${paymentConfig.formatCents(atual)}*`, 'bot');
            } catch (error) {
                console.error('Falha ao ler valor global do cartão:', error.message);
                return ctx.replyNYX('❌ A configuração do valor está inválida ou corrompida. Verifique o arquivo de configuração antes de tentar alterá-lo.', 'bot');
            }
        }

        const cents = paymentConfig.parseBRL(args.join(' '));
        if (cents === null) {
            return ctx.replyNYX('❌ Valor inválido. Use, por exemplo: 25, 25,90, 25.90 ou R$ 1.234,56. O valor não foi alterado.', 'bot');
        }

        try {
            paymentConfig.saveCents(cents);
            return ctx.replyNYX(`✅ Valor global do cartão atualizado para *${paymentConfig.formatCents(cents)}*.`, 'bot');
        } catch (error) {
            console.error('Falha ao salvar valor global do cartão:', error.message);
            return ctx.replyNYX('❌ Não foi possível salvar o valor. A configuração anterior foi preservada.', 'bot');
        }
    }
};
