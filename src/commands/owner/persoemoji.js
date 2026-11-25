const ownerOnly = require('../../utils/ownerOnly');
const {
    DEFAULT_EMOJI,
    getBotEmoji,
    validarEmoji,
    salvarEmoji,
    resetarEmoji
} = require('../../utils/botEmoji');

module.exports = {
    name: ['persoemoji', 'setemoji', 'personalizaremoji'],
    description: 'Altera o emoji visual global do bot',
    execute: async ctx => {
        ownerOnly(ctx);

        const args = Array.isArray(ctx.args) ? ctx.args : [];
        const entrada = args.join(' ').trim();

        if (!entrada) {
            return ctx.replyNYX(`🎨 Emoji global atual: ${getBotEmoji()}\n\nUso: ${ctx.prefix}persoemoji <emoji>\nExemplo: ${ctx.prefix}persoemoji 🩸\nRestaurar: ${ctx.prefix}persoemoji reset`, 'bot');
        }

        if (entrada.toLowerCase() === 'reset' || entrada.toLowerCase() === 'padrao' || entrada.toLowerCase() === 'padrão') {
            resetarEmoji();
            return ctx.replyNYX(`✅ Emoji global restaurado para ${DEFAULT_EMOJI}.`, 'bot');
        }

        const emoji = validarEmoji(entrada);
        if (!emoji) {
            return ctx.replyNYX(`❌ Emoji inválido. Use um único emoji ou símbolo visual, por exemplo: ${ctx.prefix}persoemoji 🩸`, 'bot');
        }

        try {
            salvarEmoji(emoji);
            return ctx.replyNYX(`✅ Emoji global alterado para ${emoji}.\nMenus e botões compatíveis usarão essa identidade visual a partir de agora.`, 'bot');
        } catch (error) {
            console.error('[PERSOEMOJI] Erro ao salvar:', error.message);
            return ctx.replyNYX('❌ Não foi possível salvar o novo emoji. O valor anterior foi preservado.', 'bot');
        }
    }
};
