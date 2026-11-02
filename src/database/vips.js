const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const storageDirectory = path.join(__dirname, "storage");
const storageFile = path.join(storageDirectory, "vips.json");

function databaseError(action, cause) {
    const error = new Error(`Não foi possível ${action} o banco de VIPs.`);
    error.cause = cause;
    return error;
}

function normalizeVipId(userId) {
    const value = String(userId || "").trim();
    if (!value || value.endsWith("@g.us") || !/@(?:s\.whatsapp\.net|lid)$/.test(value)) {
        throw new Error("VIP_USER_REQUIRED");
    }
    return value;
}

function validateRecord(userId, record) {
    if (
        !record ||
        Array.isArray(record) ||
        typeof record !== "object" ||
        record.userId !== userId ||
        typeof record.addedAt !== "string" ||
        Number.isNaN(Date.parse(record.addedAt))
    ) {
        throw new Error(`Registro VIP inválido para ${userId}.`);
    }
}

function validateVips(data) {
    for (const [userId, record] of Object.entries(data)) {
        validateRecord(userId, record);
    }
    return data;
}

function readVips() {
    if (!fs.existsSync(storageFile)) {
        return {};
    }

    let content;
    try {
        content = fs.readFileSync(storageFile, "utf8");
    } catch (error) {
        throw databaseError("ler", error);
    }

    if (!content.trim()) {
        return {};
    }

    try {
        const data = JSON.parse(content);
        if (!data || Array.isArray(data) || typeof data !== "object") {
            throw new Error("Formato raiz inválido.");
        }
        return validateVips(data);
    } catch (error) {
        throw databaseError("interpretar", error);
    }
}

function writeAtomically(content) {
    const temporaryFile = path.join(
        storageDirectory,
        `.vips.json.${process.pid}.${randomUUID()}.tmp`
    );
    let descriptor;
    let temporaryCreated = false;

    try {
        fs.mkdirSync(storageDirectory, { recursive: true });
        descriptor = fs.openSync(temporaryFile, "wx");
        temporaryCreated = true;
        fs.writeFileSync(descriptor, content, "utf8");
        fs.closeSync(descriptor);
        descriptor = undefined;
        fs.renameSync(temporaryFile, storageFile);
        temporaryCreated = false;
    } catch (error) {
        if (descriptor !== undefined) {
            try { fs.closeSync(descriptor); } catch (_) {}
        }
        if (temporaryCreated) {
            try { fs.unlinkSync(temporaryFile); } catch (_) {}
        }
        throw databaseError("gravar", error);
    }
}

function saveVips(data) {
    writeAtomically(JSON.stringify(data, null, 4));
}

function addVip(userId, now = new Date()) {
    const id = normalizeVipId(userId);
    const data = readVips();
    if (data[id]) {
        return { ...data[id], alreadyPresent: true };
    }

    const record = {
        userId: id,
        addedAt: new Date(now).toISOString()
    };
    data[id] = record;
    saveVips(data);
    return { ...record, alreadyPresent: false };
}

function removeVip(userId) {
    const id = normalizeVipId(userId);
    const data = readVips();
    if (!Object.hasOwn(data, id)) {
        return false;
    }
    delete data[id];
    saveVips(data);
    return true;
}

function getVip(userId) {
    const id = normalizeVipId(userId);
    const data = readVips();
    return data[id] ? { ...data[id] } : null;
}

function listVips() {
    return Object.values(readVips())
        .map(record => ({ ...record }))
        .sort((left, right) => left.userId.localeCompare(right.userId));
}

function isVip(userId) {
    try {
        return Boolean(getVip(userId));
    } catch (error) {
        // IDs inválidos nunca recebem privilégio VIP; erros reais do banco sobem.
        if (error && error.message === "VIP_USER_REQUIRED") return false;
        throw error;
    }
}

module.exports = {
    storageFile,
    normalizeVipId,
    addVip,
    removeVip,
    getVip,
    isVip,
    listVips,
    writeAtomically
};
