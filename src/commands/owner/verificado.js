const ownerOnly = require('../../utils/ownerOnly');
const db = require('../../database/securityGroups');
const { getTarget } = require('../../utils/checkTarget');

module.exports = {
    name: ['verificado'],
    description: 'Marca ou desmarca usuário como verificado neste grupo',
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.reply('❌ Use em um grupo.');
        
        const target = getTarget(ctx);
        if (!target) return ctx.reply('Marque/responda ao usuário e informe on ou off.');
        
        // Correção: procura 'on' ou 'off' em qualquer posição dos argumentos
        const argsLower = ctx.args.map(a => String(a).toLowerCase());
        const actionOn = argsLower.find(a => ['on', 'add', 'adicionar'].includes(a));
        const actionOff = argsLower.find(a => ['off', 'del', 'remover'].includes(a));
        const action = actionOn || actionOff;

        if (!action) return ctx.reply('Uso: 7verificado on/off com usuário marcado.');
        
        const enabled = ['on', 'add', 'adicionar'].includes(action);
        db.setVerified(ctx.chat, target, enabled);
        await ctx.replyNYX(enabled ? '✅ Usuário marcado como verificado neste grupo.' : 'Verificação removida deste grupo.', 'bot');
    }
};