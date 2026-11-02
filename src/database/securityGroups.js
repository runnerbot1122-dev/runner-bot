const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const dir = path.join(__dirname, 'storage');
const file = process.env.SECURITY_GROUPS_FILE || path.join(dir, 'security-groups.json');

function read() {
  if (!fs.existsSync(file)) return { groups: {}, globalVerified: {}, antiPvLevel: 0 };
  let data;
  try { 
    data = JSON.parse(fs.readFileSync(file, 'utf8')); 
  } catch (e) { 
    throw new Error(`Banco de segurança inválido: ${e.message}`); 
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Banco de segurança inválido.');
  data.groups ||= {}; 
  data.globalVerified ||= {}; 
  data.antiPvLevel = Number.isInteger(data.antiPvLevel) ? data.antiPvLevel : 0;
  return data;
}

function save(data) {
  fs.mkdirSync(path.dirname(file), {recursive:true});
  const tmp = `${file}.${process.pid}.${randomUUID()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), {flag:'wx'});
  try { 
    fs.renameSync(tmp, file); 
  } catch(e) { 
    try { fs.unlinkSync(tmp); } catch(_){} 
    throw e; 
  }
}

function group(data, jid) { 
  if (!jid || !jid.endsWith('@g.us')) throw new Error('GROUP_REQUIRED'); 
  data.groups[jid] ||= { 
    subowners: [], groupOwners: [], verified: {}, blacklist: [], 
    adminUsage: {}, antiArqv: false, soDono: false, noPrefixList: [], perms: {}
  };
  
  data.groups[jid].groupOwners ||= []; 
  data.groups[jid].subowners ||= []; 
  data.groups[jid].verified ||= {}; 
  data.groups[jid].blacklist ||= []; 
  data.groups[jid].adminUsage ||= {}; 
  data.groups[jid].antiArqv = Boolean(data.groups[jid].antiArqv); 
  data.groups[jid].soDono = Boolean(data.groups[jid].soDono); 
  data.groups[jid].noPrefixList ||= []; 
  data.groups[jid].perms ||= {}; 
  
  return data.groups[jid]; 
}

function normUser(id) { 
  const s = String(id || '').trim().toLowerCase(); 
  if (/^\d+(?::\d+)?@s\.whatsapp\.net$/.test(s) || /^\d+(?::\d+)?@lid$/.test(s)) return s.replace(/:\d+(?=@)/, '').toLowerCase(); 
  if (/^\+?\d{10,15}$/.test(s)) return s.replace(/\D/g, '') + '@s.whatsapp.net'; 
  throw new Error('USER_REQUIRED'); 
}

function updateList(jid, key, id, add) { 
  const d = read(), g = group(d, jid), user = normUser(id), list = g[key]; 
  const index = list.findIndex(item => { try { return normUser(item) === user; } catch (_) { return false; } });
  const had = index >= 0; 
  if (add && !had) list.push(user); 
  if (!add && had) list.splice(index, 1); 
  if (had !== add) save(d); 
  return had === add ? false : true; 
}

function list(jid, key) { 
  return [...(group(read(), jid)[key] || [])]; 
}

function addSubowner(jid,id){return updateList(jid,'subowners',id,true)}
function addGroupOwner(jid,id){return updateList(jid,'groupOwners',id,true)}
function removeGroupOwner(jid,id){return updateList(jid,'groupOwners',id,false)}
function isGroupOwnerStrict(jid,id){const alvo=normUser(id);return list(jid,'groupOwners').some(cadastrado=>{try{return normUser(cadastrado)===alvo}catch(_){return false}})}
function isGroupOwner(jid,id){try{return isGroupOwnerStrict(jid,id)}catch(_){return false}}
function getGroupOwners(jid){return list(jid,'groupOwners')}
function removeSubowner(jid,id){return updateList(jid,'subowners',id,false)}
function isSubowner(jid,id){try{return list(jid,'subowners').includes(normUser(id))}catch(_){return false}}
function addBlacklist(jid,id){return updateList(jid,'blacklist',id,true)}
function removeBlacklist(jid,id){return updateList(jid,'blacklist',id,false)}
function isBlacklisted(jid,id){try{return list(jid,'blacklist').includes(normUser(id))}catch(_){return false}}
function setVerified(jid,id,value){const d=read(),g=group(d,jid),u=normUser(id);if(value)g.verified[u]=true;else delete g.verified[u];save(d);}
function setGlobalVerified(id,value){const d=read(),u=normUser(id);if(value)d.globalVerified[u]=true;else delete d.globalVerified[u];save(d);}
function verified(jid,id){const d=read(),u=normUser(id);return Boolean(d.globalVerified[u] || d.groups[jid]?.verified?.[u]);}
function getAntiPvLevel(){return read().antiPvLevel}
function setAntiPvLevel(level){if(!Number.isInteger(level)||level<0||level>3)throw new Error('INVALID_ANTIPV_LEVEL');const d=read();d.antiPvLevel=level;save(d);return level}
function recordAdminUse(jid,id){const d=read(),g=group(d,jid),u=normUser(id);g.adminUsage[u]=(g.adminUsage[u]||0)+1;save(d);return g.adminUsage[u]}
function getAdminUsage(jid){return {...group(read(),jid).adminUsage}}
function isAntiArqvEnabled(jid){return Boolean(group(read(),jid).antiArqv)}
function setAntiArqv(jid, enabled){const d=read(),g=group(d,jid);g.antiArqv=Boolean(enabled);save(d);return g.antiArqv}
function getSubowners(jid){return list(jid,'subowners')}
function getBlacklist(jid){return list(jid,'blacklist')}

// ==========================================
// FUNÇÕES DO SO_DONO
// ==========================================
function isSoDonoEnabled(jid){ return Boolean(group(read(), jid).soDono); }
function setSoDono(jid, enabled){ const d = read(), g = group(d, jid); g.soDono = Boolean(enabled); save(d); return g.soDono; }

// ==========================================
// FUNÇÕES DO NO-PREFIX (Comandos autorizados sem prefixo)
// ==========================================
function getNoPrefixList(jid) {
    return [...(group(read(), jid).noPrefixList || [])];
}

function addNoPrefix(jid, comando) {
    const d = read(), g = group(d, jid);
    if (!g.noPrefixList) g.noPrefixList = [];
    if (!g.noPrefixList.includes(comando)) {
        g.noPrefixList.push(comando);
        save(d);
    }
    return g.noPrefixList;
}

function removeNoPrefix(jid, comando) {
    const d = read(), g = group(d, jid);
    if (!g.noPrefixList) g.noPrefixList = [];
    const index = g.noPrefixList.indexOf(comando);
    if (index > -1) {
        g.noPrefixList.splice(index, 1);
        save(d);
    }
    return g.noPrefixList;
}

// ==========================================
// FUNÇÕES DE PERMISSÕES MANUAIS (PERMS)
// ==========================================
function getPerms(jid) {
    return { ...(group(read(), jid).perms || {}) };
}

function addPerm(jid, target, command) {
    const d = read(), g = group(d, jid);
    if (!g.perms) g.perms = {};
    if (!g.perms[target]) g.perms[target] = [];
    if (!g.perms[target].includes(command)) {
        g.perms[target].push(command);
        save(d);
        return true;
    }
    return false;
}

function removePerm(jid, target, command) {
    const d = read(), g = group(d, jid);
    if (!g.perms || !g.perms[target]) return false;
    const index = g.perms[target].indexOf(command);
    if (index > -1) {
        g.perms[target].splice(index, 1);
        if (g.perms[target].length === 0) delete g.perms[target];
        save(d);
        return true;
    }
    return false;
}

function clearPerms(jid, target) {
    const d = read(), g = group(d, jid);
    if (!g.perms || !g.perms[target]) return false;
    delete g.perms[target];
    save(d);
    return true;
}

function hasPerm(jid, target, command) {
    const d = read();
    const perms = d.groups[jid]?.perms?.[target];
    return Array.isArray(perms) && perms.includes(command);
}

module.exports = {
  file, normUser, addGroupOwner, removeGroupOwner, isGroupOwner, isGroupOwnerStrict, getGroupOwners, 
  addSubowner, removeSubowner, isSubowner, getSubowners, addBlacklist, removeBlacklist, 
  isBlacklisted, getBlacklist, setVerified, setGlobalVerified, verified, getAntiPvLevel, 
  setAntiPvLevel, recordAdminUse, getAdminUsage, isAntiArqvEnabled, setAntiArqv,
  isSoDonoEnabled, setSoDono,
  getNoPrefixList, addNoPrefix, removeNoPrefix,
  getPerms, addPerm, removePerm, clearPerms, hasPerm
};