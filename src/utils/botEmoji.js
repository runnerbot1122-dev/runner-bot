const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const DEFAULT_EMOJI = '💸';
const CONFIG_FILE = process.env.BOT_EMOJI_CONFIG_FILE || path.join(__dirname, '../config/bot-emoji.json');

function normalizarEmoji(value) {
    return String(value || '').trim().replace(/[\r\n]/g, '');
}

function getBotEmoji() {
    try {
        if (!fs.existsSync(CONFIG_FILE)) return DEFAULT_EMOJI;
        const parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        const emoji = normalizarEmoji(parsed?.emoji);
        return emoji || DEFAULT_EMOJI;
    } catch (error) {
        console.error('[BOT EMOJI] Configuração inválida; usando padrão:', error.message);
        return DEFAULT_EMOJI;
    }
}

function validarEmoji(value) {
    const emoji = normalizarEmoji(value);
    if (!emoji || emoji.length > 16 || /[<>]/.test(emoji)) return null;
    return emoji;
}

function salvarEmoji(value) {
    const emoji = validarEmoji(value);
    if (!emoji) throw new TypeError('Emoji inválido.');

    const dir = path.dirname(CONFIG_FILE);
    fs.mkdirSync(dir, { recursive: true });
    const temporario = path.join(dir, `.${path.basename(CONFIG_FILE)}.${process.pid}.${randomUUID()}.tmp`);
    let fd;
    try {
        fd = fs.openSync(temporario, 'wx');
        fs.writeFileSync(fd, `${JSON.stringify({ emoji }, null, 2)}\n`, 'utf8');
        fs.closeSync(fd);
        fd = undefined;
        fs.renameSync(temporario, CONFIG_FILE);
    } catch (error) {
        if (fd !== undefined) {
            try { fs.closeSync(fd); } catch (_) {}
        }
        try { fs.unlinkSync(temporario); } catch (_) {}
        throw error;
    }
    return emoji;
}

function resetarEmoji() {
    return salvarEmoji(DEFAULT_EMOJI);
}

module.exports = {
    DEFAULT_EMOJI,
    CONFIG_FILE,
    getBotEmoji,
    validarEmoji,
    salvarEmoji,
    resetarEmoji
};
