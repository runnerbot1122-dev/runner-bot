const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const file = process.env.AFK_FILE || path.join(__dirname, 'storage', 'afk.json');
function read() {
  try { const v = JSON.parse(fs.readFileSync(file, 'utf8')); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  catch (e) { if (e.code === 'ENOENT') return {}; throw e; }
}
function write(data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${randomUUID()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, file);
}
function set(jid, reason = '') { if (!jid) throw new Error('JID_REQUIRED'); const d = read(); d[jid] = { since: Date.now(), reason: String(reason).trim().slice(0, 300) }; write(d); return d[jid]; }
function get(jid) { return read()[jid] || null; }
function remove(jid) { const d = read(); const old = d[jid] || null; if (old) { delete d[jid]; write(d); } return old; }
function formatDuration(ms) { let s = Math.max(0, Math.floor(ms / 1000)); const days = Math.floor(s / 86400); s %= 86400; const hours = Math.floor(s / 3600); s %= 3600; const mins = Math.floor(s / 60); s %= 60; const parts = []; if (days) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`); if (hours) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`); if (mins) parts.push(`${mins} ${mins === 1 ? 'minuto' : 'minutos'}`); if (s || !parts.length) parts.push(`${s} ${s === 1 ? 'segundo' : 'segundos'}`); return parts.slice(0, 2).join(' e '); }
module.exports = { set, get, remove, formatDuration };
