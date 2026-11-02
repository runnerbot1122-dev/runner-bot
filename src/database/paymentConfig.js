const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const DEFAULT_FILE = path.join(__dirname, '../config/payment-value.json');
const MAX_CENTS = Number.MAX_SAFE_INTEGER;

function getConfigFile() {
    return process.env.PAYMENT_CONFIG_FILE || DEFAULT_FILE;
}

function validarCents(cents) {
    return Number.isSafeInteger(cents) && cents >= 0;
}

function readFrom(file) {
    if (!fs.existsSync(file)) return null;

    let parsed;
    try {
        parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
        const wrapped = new Error('PAYMENT_CONFIG_CORRUPT: não foi possível ler o JSON de configuração.');
        wrapped.code = 'PAYMENT_CONFIG_CORRUPT';
        wrapped.cause = error;
        throw wrapped;
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !validarCents(parsed.cents)) {
        const error = new Error('PAYMENT_CONFIG_INVALID: o arquivo deve conter "cents" como inteiro não negativo seguro.');
        error.code = 'PAYMENT_CONFIG_INVALID';
        throw error;
    }

    return parsed.cents;
}

function saveTo(file, cents) {
    if (!validarCents(cents)) {
        throw new TypeError('O valor deve ser um inteiro não negativo em centavos.');
    }

    const dir = path.dirname(file);
    fs.mkdirSync(dir, { recursive: true });
    const temp = path.join(dir, `.${path.basename(file)}.${process.pid}.${randomUUID()}.tmp`);
    const contents = `${JSON.stringify({ cents }, null, 2)}\n`;
    let fd;
    let tempCreated = false;

    try {
        fd = fs.openSync(temp, 'wx');
        tempCreated = true;
        fs.writeFileSync(fd, contents, 'utf8');
        fs.closeSync(fd);
        fd = undefined;
        fs.renameSync(temp, file);
        tempCreated = false;
    } catch (error) {
        if (fd !== undefined) {
            try { fs.closeSync(fd); } catch (_) {}
        }
        if (tempCreated) {
            try { fs.unlinkSync(temp); } catch (_) {}
        }
        throw error;
    }

    return cents;
}

function parseBRL(input) {
    if (typeof input !== 'string') return null;

    let value = input.trim();
    if (!value) return null;
    if (/^R\$/i.test(value)) value = value.replace(/^R\$\s*/i, '');
    if (!value || /\s|[^\d.,]/.test(value) || /[-+]/.test(value)) return null;

    let reais;
    let centavos = 0;

    // Formato brasileiro com separador de milhar e centavos: 1.234,56.
    const ptThousands = value.match(/^(\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/);
    // Decimal explícito por vírgula: 25,9 ou 25,90.
    const commaDecimal = value.match(/^(\d+),(\d{1,2})$/);
    // Decimal por ponto, aceito para entradas comuns como 25.90.
    const dotDecimal = value.match(/^(\d+)\.(\d{1,2})$/);
    // Inteiro com ou sem agrupamento de milhares brasileiro.
    const groupedInteger = value.match(/^(\d{1,3}(?:\.\d{3})+)$/);
    const plainInteger = value.match(/^(\d+)$/);

    if (ptThousands) {
        reais = Number(ptThousands[1].replace(/\./g, ''));
        centavos = Number((ptThousands[2] || '').padEnd(2, '0') || 0);
    } else if (commaDecimal) {
        reais = Number(commaDecimal[1]);
        centavos = Number(commaDecimal[2].padEnd(2, '0'));
    } else if (dotDecimal) {
        reais = Number(dotDecimal[1]);
        centavos = Number(dotDecimal[2].padEnd(2, '0'));
    } else if (groupedInteger) {
        reais = Number(value.replace(/\./g, ''));
    } else if (plainInteger) {
        reais = Number(value);
    } else {
        return null;
    }

    const cents = reais * 100 + centavos;
    if (!Number.isSafeInteger(reais) || !Number.isSafeInteger(cents) || cents < 0 || cents > MAX_CENTS) return null;
    return cents;
}

function formatCents(cents) {
    if (cents === null || cents === undefined) return 'Não configurado';
    if (!validarCents(cents)) throw new TypeError('Valor inválido para formatação em BRL.');
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(cents / 100);
}

function createStore(file) {
    if (typeof file !== 'string' || !file.trim()) throw new TypeError('Caminho de configuração inválido.');
    return {
        file,
        readCents: () => readFrom(file),
        saveCents: cents => saveTo(file, cents)
    };
}

function readCents() {
    return readFrom(getConfigFile());
}

function saveCents(cents) {
    return saveTo(getConfigFile(), cents);
}

module.exports = {
    DEFAULT_FILE,
    getConfigFile,
    createStore,
    readCents,
    saveCents,
    parseBRL,
    formatCents
};
