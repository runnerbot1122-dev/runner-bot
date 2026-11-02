const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const defaultStorageDirectory = path.join(__dirname, 'storage');
const storageFile = process.env.BLOCK_RULES_FILE || path.join(defaultStorageDirectory, 'block-rules.json');
const storageDirectory = path.dirname(storageFile);

function emptyState() {
  return { users: [], groups: [], groupCommands: {}, globalCommands: [] };
}

function normalizeUserId(value) {
  const id = String(value || '').trim().toLowerCase();
  if (/^\d{5,20}$/.test(id)) return `${id}@s.whatsapp.net`;
  if (/^[0-9]{5,20}(?::[0-9]{1,5})?@(s\.whatsapp\.net|lid)$/.test(id)) {
    const [local, domain] = id.split('@');
    return `${local.split(':')[0]}@${domain}`;
  }
  throw new Error('BLOCK_USER_ID_INVALID');
}

function normalizeGroupId(value) {
  const id = String(value || '').trim().toLowerCase();
  if (!/^[0-9]{5,30}(?:-[0-9]{5,30})?@g\.us$/.test(id)) throw new Error('BLOCK_GROUP_ID_INVALID');
  return id;
}

function normalizeCommand(value) {
  const name = String(value || '').trim().toLowerCase().replace(/^\.+/, '');
  if (!/^[a-z0-9_-]{1,64}$/.test(name)) throw new Error('BLOCK_COMMAND_INVALID');
  return name;
}

// LÃª dados persistidos de versÃµes anteriores sem deixar um Ãºnico registro legado
// invÃ¡lido derrubar todas as operaÃ§Ãµes de bloqueio. O valor invÃ¡lido Ã© preservado
// para nÃ£o apagar silenciosamente dados que podem ser Ãºteis na migraÃ§Ã£o.
function normalizeStoredList(values, normalizer) {
  if (!Array.isArray(values)) return [];
  const output = [];
  const seen = new Set();
  for (const raw of values) {
    let value = raw;
    try { value = normalizer(raw); } catch (_) { /* preserva o registro legado */ }
    let key;
    try { key = typeof value === 'string' ? `s:${value}` : `j:${JSON.stringify(value)}`; }
    catch (_) { key = `x:${String(value)}`; }
    if (!seen.has(key)) { seen.add(key); output.push(value); }
  }
  return output;
}

function normalizeStoredGroupKey(rawGroup) {
  try { return normalizeGroupId(rawGroup); }
  catch (_) { return rawGroup; }
}

function readState() {
  if (!fs.existsSync(storageFile)) return emptyState();
  let data;
  try { data = JSON.parse(fs.readFileSync(storageFile, 'utf8')); }
  catch (error) { const e = new Error('BLOCK_RULES_STORE_INVALID'); e.cause = error; throw e; }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('BLOCK_RULES_STORE_INVALID');
  const state = emptyState();
  state.users = normalizeStoredList(data.users, normalizeUserId);
  state.groups = normalizeStoredList(data.groups, normalizeGroupId);
  state.globalCommands = normalizeStoredList(data.globalCommands, normalizeCommand);
  if (data.groupCommands && typeof data.groupCommands === 'object' && !Array.isArray(data.groupCommands)) {
    for (const [rawGroup, names] of Object.entries(data.groupCommands)) {
      const group = normalizeStoredGroupKey(rawGroup);
      if (!Array.isArray(names)) {
        // Preserva formatos legados inesperados, sem usÃ¡-los como lista vÃ¡lida.
        state.groupCommands[group] = names;
        continue;
      }
      const normalized = normalizeStoredList(names, normalizeCommand);
      if (normalized.length) {
        const existing = Array.isArray(state.groupCommands[group]) ? state.groupCommands[group] : [];
        state.groupCommands[group] = [...new Set([...existing, ...normalized])];
      }
    }
  }
  return state;
}

function writeState(state) {
  fs.mkdirSync(storageDirectory, { recursive: true });
  const temp = path.join(storageDirectory, `.block-rules.${process.pid}.${randomUUID()}.tmp`);
  let fd;
  try {
    fd = fs.openSync(temp, 'wx');
    fs.writeFileSync(fd, JSON.stringify(state, null, 2), 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd); fd = undefined;
    fs.renameSync(temp, storageFile);
  } catch (error) {
    if (fd !== undefined) { try { fs.closeSync(fd); } catch (_) {} }
    try { fs.unlinkSync(temp); } catch (_) {}
    const e = new Error('BLOCK_RULES_STORE_WRITE_FAILED');
    e.cause = error;
    e.storageCauseCode = error && error.code;
    throw e;
  }
}

function mutate(fn) { const state = readState(); const result = fn(state); writeState(state); return result; }
function addToList(list, value) { if (list.includes(value)) return false; list.push(value); list.sort(); return true; }
function removeFromList(list, value) { const i = list.indexOf(value); if (i < 0) return false; list.splice(i, 1); return true; }

function blockUser(id) { const key = normalizeUserId(id); return mutate(s => addToList(s.users, key)); }
function unblockUser(id) { const key = normalizeUserId(id); return mutate(s => removeFromList(s.users, key)); }
function isUserBlocked(id) { if (!id) return false; const key = normalizeUserId(id); return readState().users.includes(key); }
function listBlockedUsers() { return readState().users; }
function blockGroup(id) { const key = normalizeGroupId(id); return mutate(s => addToList(s.groups, key)); }
function unblockGroup(id) { const key = normalizeGroupId(id); return mutate(s => removeFromList(s.groups, key)); }
function isGroupBlocked(id) { if (!id) return false; const key = normalizeGroupId(id); return readState().groups.includes(key); }
function listBlockedGroups() { return readState().groups; }
function blockCommand(name, groupId) {
  const cmd = normalizeCommand(name);
  if (groupId) { const group = normalizeGroupId(groupId); return mutate(s => { s.groupCommands[group] ||= []; return addToList(s.groupCommands[group], cmd); }); }
  return mutate(s => addToList(s.globalCommands, cmd));
}
function unblockCommand(name, groupId) {
  const cmd = normalizeCommand(name);
  if (groupId) { const group = normalizeGroupId(groupId); return mutate(s => { const list = s.groupCommands[group] || []; const changed = removeFromList(list, cmd); if (!list.length) delete s.groupCommands[group]; return changed; }); }
  return mutate(s => removeFromList(s.globalCommands, cmd));
}
function isCommandBlocked(name, groupId) {
  const cmd = normalizeCommand(name); const state = readState();
  const groupList = groupId ? state.groupCommands[normalizeGroupId(groupId)] : null;
  return state.globalCommands.includes(cmd) || Boolean(Array.isArray(groupList) && groupList.includes(cmd));
}
function listBlockedCommands(groupId) {
  const state = readState();
  if (!groupId) return state.globalCommands;
  const items = state.groupCommands[normalizeGroupId(groupId)];
  return Array.isArray(items) ? items : [];
}
function listAllBlockedCommands() { const s = readState(); return { global: s.globalCommands, groups: s.groupCommands }; }

module.exports = { storageFile, normalizeUserId, normalizeGroupId, normalizeCommand, blockUser, unblockUser, isUserBlocked, listBlockedUsers, blockGroup, unblockGroup, isGroupBlocked, listBlockedGroups, blockCommand, unblockCommand, isCommandBlocked, listBlockedCommands, listAllBlockedCommands };