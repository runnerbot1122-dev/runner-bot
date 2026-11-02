const security = require('../../database/securityGroups');
const permissions = require('../../utils/permissions');
const { enviarCartaoAntiRoubo } = require('../../utils/antiArqvCard');

function jidOf(value) {
  if (typeof value === 'string') return value;
  return value?.id || value?.jid || null;
}

async function antiArqv(sock, update) {
  const groupId = update?.id;
  if (!groupId?.endsWith('@g.us') || update?.action !== 'promote') return;
  if (!security.isAntiArqvEnabled(groupId)) return;

  const actor = jidOf(update.author || update.participant);
  const alvo = jidOf(update.participant);

  if (!actor || security.isGroupOwner(groupId, actor)) return;
  
  try {
      const perm = await permissions.getPermissions(sock, groupId, actor);
      if (perm.isMaster || perm.isOwner) return;
  } catch (_) {
      return; 
  }

  let metadata;
  let groupName = "Desconhecido";
  try { 
      metadata = await sock.groupMetadata(groupId); 
      groupName = metadata.subject || groupName;
  } catch (_) { return; }
  
  const actorInfo = (metadata?.participants || []).find(p => jidOf(p) === actor);
  if (!actorInfo || !(actorInfo.admin === 'admin' || actorInfo.admin === 'superadmin')) return;

  try {
    const result = await sock.groupParticipantsUpdate(groupId, [actor], 'demote');
    const confirmed = Array.isArray(result) && result.some(r => r && r.status === '200' && (!r.jid || r.jid === actor));
    
    if (!confirmed) {
      await enviarCartaoAntiRoubo(sock, groupId, groupName, actor, alvo, false);
      return;
    }
    await enviarCartaoAntiRoubo(sock, groupId, groupName, actor, alvo, true);
  } catch (_) {
    try { await enviarCartaoAntiRoubo(sock, groupId, groupName, actor, alvo, false); } catch (_) {}
  }
}

module.exports = antiArqv;