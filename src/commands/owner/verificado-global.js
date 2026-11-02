const ownerOnly = require('../../utils/ownerOnly');
const db = require('../../database/securityGroups');
const { getTarget } = require('../../utils/checkTarget');

module.exports = {
    name: ['verificado-global', 'verificadoglobal'],
    description: 'Marca ou desmarca usuário como verificado globalmente',
    execute: async (ctx) => {
        ownerOnly(ctx);
        
        const target = getTarget(ctx);
        if (!target) return ctx.reply('Marque/responda ao usuário e informe on ou off.');
        
        // Correção: procura 'on' ou 'off' em qualquer posição dos argumentos
        const argsLower = ctx.args.map(a => String(a).toLowerCase());
        const actionOn = argsLower.find(a => ['on', 'add', 'adicionar'].includes(a));
        const actionOff = argsLower.find(a => ['off', 'del', 'remover'].includes(a));
        const action = actionOn || actionOff;

        if (!action) return ctx.reply('Uso: 7verificado-global on/off com usuário marcado.');
        
        const enabled = ['on', 'add', 'adicionar'].includes(action);
        db.setGlobalVerified(target, enabled);
        await ctx.replyNYX(enabled ? '✅ Usuário marcado como verificado globalmente.' : 'Verificação global removida.', 'bot');
    }
};