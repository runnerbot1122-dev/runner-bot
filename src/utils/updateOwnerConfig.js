const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config/config.js');
function replaceString(source, key, value) {
  const escaped = JSON.stringify(String(value));
  const re = new RegExp(`(^\\s*${key}\\s*:\\s*)(["'][^\\n]*?["'])(\\s*,?)`, 'm');
  if (!re.test(source)) throw new Error(`CONFIG_KEY_NOT_FOUND:${key}`);
  return source.replace(re, `$1${escaped}$3`);
}
function setNick(value) {
  const name = String(value || '').trim();
  if (!name || name.length > 40 || /[\r\n]/.test(name)) throw new Error('INVALID_NICK');
  let source = fs.readFileSync(configPath, 'utf8');
  source = replaceString(source, 'creator', name);
  fs.writeFileSync(configPath, source, 'utf8');
  const config = require('../config/config'); config.creator = name;
  return name;
}
function setNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) throw new Error('INVALID_NUMBER');
  let source = fs.readFileSync(configPath, 'utf8');
  const re = /(^\s*owners\s*:\s*)\[[^\]]*\](\s*,?)/m;
  if (!re.test(source)) throw new Error('CONFIG_KEY_NOT_FOUND:owners');
  source = source.replace(re, `$1[${JSON.stringify(digits)}]$2`);
  fs.writeFileSync(configPath, source, 'utf8');
  const config = require('../config/config'); config.owners = [digits]; config.owner = digits;
  return digits;
}
module.exports = { setNick, setNumber };
