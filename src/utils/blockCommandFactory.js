const { requireOwner } = require('./checkPermission');
const rules = require('../database/blockRules');

function makeCommand({ name, description, action, scope, list }) {
  return {
    name,
    description,
    execute: async ctx => {
      requireOwner(ctx);
      const groupId = scope === 'group' ? ctx.chat : null;
      if (scope === 'group' && !ctx.isGroup) return ctx.replyNYX('⚠️ Use este comando dentro do grupo que deseja configurar.', 'bot');
      try {
        if (action === 'list') {
          const items = list === 'groups' ? rules.listBlockedGroups()
            : list === 'users' ? rules.listBlockedUsers()
            : list === 'globalCommands' ? rules.listBlockedCommands()
            : rules.listBlockedCommands(groupId);
          return ctx.replyNYX(items.length ? `📋 Lista (${items.length}):\n${items.map(x => `• ${x}`).join('\n')}` : '📋 Não há itens bloqueados nesta lista.', 'bot');
        }
        const input = String(ctx.args?.[0] || '').trim();
        if (action === 'addUser' || action === 'removeUser') {
          const mentioned = require('./mentions').getMentioned(ctx.message);
          const target = mentioned || input;
          if (!target) return ctx.replyNYX('⚠️ Marque a pessoa ou informe o número/JID.', 'bot');
          const changed = action === 'addUser' ? rules.blockUser(target) : rules.unblockUser(target);
          return ctx.replyNYX(changed ? (action === 'addUser' ? `🚫 Usuário bloqueado: ${target}` : `✅ Usuário desbloqueado: ${target}`) : 'ℹ️ Nenhuma alteração: esse estado já estava configurado.', 'bot');
        }
        if (action === 'addGroup' || action === 'removeGroup') {
          const target = input || (ctx.isGroup ? ctx.chat : '');
          if (!target) return ctx.replyNYX('⚠️ Use em um grupo ou informe o ID do grupo.', 'bot');
          const changed = action === 'addGroup' ? rules.blockGroup(target) : rules.unblockGroup(target);
          return ctx.replyNYX(changed ? (action === 'addGroup' ? `🚫 Bot bloqueado no grupo ${target}.` : `✅ Bot desbloqueado no grupo ${target}.`) : 'ℹ️ Nenhuma alteração: esse estado já estava configurado.', 'bot');
        }
        if (action === 'addCommand' || action === 'removeCommand') {
          if (!input) return ctx.replyNYX(`⚠️ Informe o nome do comando sem prefixo. Ex.: ${ctx.prefix}${name} fig`, 'bot');
          const command = rules.normalizeCommand(input);
          const commands = require('../core/loader');
          if (!commands.has(command)) return ctx.replyNYX(`❌ O comando "${command}" não está registrado.`, 'bot');
          const changed = action === 'addCommand' ? rules.blockCommand(command, groupId) : rules.unblockCommand(command, groupId);
          return ctx.replyNYX(changed ? (action === 'addCommand' ? `🚫 Comando ${command} bloqueado${groupId ? ' neste grupo' : ' globalmente'}.` : `✅ Bloqueio do comando ${command} removido${groupId ? ' neste grupo' : ' globalmente'}.`) : 'ℹ️ Nenhuma alteração: esse estado já estava configurado.', 'bot');
        }
      } catch (error) {
        const message = error.message === 'BLOCK_USER_ID_INVALID' ? 'Identificador de usuário inválido. Informe um número ou JID válido.'
          : error.message === 'BLOCK_GROUP_ID_INVALID' ? 'ID de grupo inválido.'
          : error.message === 'BLOCK_COMMAND_INVALID' ? 'Nome de comando inválido.'
          : error.message === 'BLOCK_RULES_STORE_INVALID' ? 'O arquivo da lista de bloqueios está inválido. Faça uma cópia antes de corrigir o JSON.'
          : error.message === 'BLOCK_RULES_STORE_WRITE_FAILED' ? 'Não consegui salvar a lista de bloqueios. Verifique a permissão de escrita da pasta de armazenamento e a configuração BLOCK_RULES_FILE.'
          : 'Não foi possível atualizar/consultar a lista de bloqueios. Consulte o log do servidor para ver a causa.';
        console.error(`Erro no comando ${name}:`, error);
        return ctx.replyNYX(`❌ ${message}`, 'bot');
      }
    }
  };
}
module.exports = makeCommand;