const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const storageDirectory = path.join(__dirname, "storage");
const storageFile = path.join(storageDirectory, "rentals.json");
const modeFile = path.join(storageDirectory, "rental-mode.json");

const MAX_RENTAL_DAYS = 3650;
const MAX_RENTAL_HOURS = 23;

function databaseError(action, cause) {
    const error = new Error(
        `Não foi possível ${action} o banco de aluguéis.`
    );
    error.cause = cause;
    return error;
}

function validateRentalRecord(groupId, record) {
    if (
        !record ||
        Array.isArray(record) ||
        typeof record !== "object" ||
        record.groupId !== groupId ||
        !groupId.endsWith("@g.us") ||
        record.active !== true ||
        typeof record.updatedAt !== "string" ||
        Number.isNaN(Date.parse(record.updatedAt))
    ) {
        throw new Error(`Registro de aluguel inválido para ${groupId}.`);
    }

    if (
        record.expiresAt !== undefined &&
        (
            typeof record.expiresAt !== "string" ||
            Number.isNaN(Date.parse(record.expiresAt))
        )
    ) {
        throw new Error(`Vencimento de aluguel inválido para ${groupId}.`);
    }
}

function validateRentals(data) {
    for (const [groupId, record] of Object.entries(data)) {
        validateRentalRecord(groupId, record);
    }
    return data;
}

function parseObjectFile(file, action, emptyValue) {
    if (!fs.existsSync(file)) {
        return emptyValue;
    }

    let content;
    try {
        content = fs.readFileSync(file, "utf8");
    } catch (error) {
        throw databaseError("ler", error);
    }

    if (!content.trim()) {
        return emptyValue;
    }

    try {
        const data = JSON.parse(content);
        if (!data || Array.isArray(data) || typeof data !== "object") {
            throw new Error("Formato raiz inválido.");
        }
        return action(data);
    } catch (error) {
        throw databaseError("interpretar", error);
    }
}

function readRentals() {
    return parseObjectFile(storageFile, validateRentals, {});
}

function readMode() {
    return parseObjectFile(modeFile, data => {
        if (typeof data.enabled !== "boolean") {
            throw new Error("Estado global de aluguel inválido.");
        }
        return data;
    }, { enabled: false });
}

function writeFileAtomically(destination, content, temporaryName) {
    const temporaryFile = path.join(
        storageDirectory,
        `.${temporaryName}.${process.pid}.${randomUUID()}.tmp`
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
        fs.renameSync(temporaryFile, destination);
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

function writeAtomically(content) {
    return writeFileAtomically(storageFile, content, "rentals.json");
}

function saveRentals(data) {
    writeAtomically(JSON.stringify(data, null, 4));
}

function saveMode(enabled) {
    writeFileAtomically(
        modeFile,
        JSON.stringify({ enabled: Boolean(enabled) }, null, 4),
        "rental-mode.json"
    );
}

function normalizeGroupId(groupId) {
    const value = String(groupId || "").trim();
    if (!value.endsWith("@g.us")) {
        throw new Error("RENTAL_GROUP_REQUIRED");
    }
    return value;
}

function parseExpiry(expiresAt) {
    if (typeof expiresAt !== "string" || Number.isNaN(Date.parse(expiresAt))) {
        throw new Error("RENTAL_EXPIRY_REQUIRED");
    }
    return new Date(expiresAt).toISOString();
}

function isExpired(record, now = new Date()) {
    return record.expiresAt !== undefined &&
        new Date(record.expiresAt).getTime() <= new Date(now).getTime();
}

function registerRental(groupId, expiresAt, now = new Date()) {
    const id = normalizeGroupId(groupId);
    const data = readRentals();
    const record = {
        groupId: id,
        active: true,
        updatedAt: new Date(now).toISOString(),
        expiresAt: parseExpiry(expiresAt)
    };
    data[id] = record;
    saveRentals(data);
    return { ...record };
}

function removeRental(groupId) {
    const id = normalizeGroupId(groupId);
    const data = readRentals();
    if (!Object.hasOwn(data, id)) {
        return false;
    }
    delete data[id];
    saveRentals(data);
    return true;
}

function getRental(groupId, now = new Date()) {
    const id = normalizeGroupId(groupId);
    const data = readRentals();
    const record = data[id];
    if (!record || isExpired(record, now)) {
        return null;
    }
    return { ...record };
}

function listRentals(now = new Date()) {
    return Object.values(readRentals())
        .filter(record => !isExpired(record, now))
        .map(record => ({ ...record }))
        .sort((left, right) => String(left.groupId).localeCompare(String(right.groupId)));
}

function getRentalMode() {
    return readMode().enabled;
}

function toggleRentalMode() {
    const enabled = !getRentalMode();
    saveMode(enabled);
    return enabled;
}

module.exports = {
    storageFile,
    modeFile,
    MAX_RENTAL_DAYS,
    MAX_RENTAL_HOURS,
    normalizeGroupId,
    registerRental,
    removeRental,
    getRental,
    listRentals,
    getRentalMode,
    toggleRentalMode,
    writeAtomically
};
