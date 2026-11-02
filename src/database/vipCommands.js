const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const storageDirectory = path.join(__dirname, "storage");
const storageFile = path.join(storageDirectory, "vip-commands.json");

function normalizeCommandName(name) {
    const value = String(name || "").trim().toLowerCase().replace(/^\.+/, "");
    if (!/^[a-z0-9_-]{1,64}$/.test(value)) {
        throw new Error("VIP_COMMAND_NAME_INVALID");
    }
    return value;
}

function readNames() {
    if (!fs.existsSync(storageFile)) return [];
    let parsed;
    try {
        parsed = JSON.parse(fs.readFileSync(storageFile, "utf8"));
    } catch (error) {
        const wrapped = new Error("Não foi possível interpretar o banco de comandos VIP.");
        wrapped.cause = error;
        throw wrapped;
    }
    if (!Array.isArray(parsed) || parsed.some(name => typeof name !== "string")) {
        throw new Error("Formato inválido no banco de comandos VIP.");
    }
    return [...new Set(parsed.map(normalizeCommandName))].sort();
}

function writeNames(names) {
    fs.mkdirSync(storageDirectory, { recursive: true });
    const temp = path.join(storageDirectory, `.vip-commands.${process.pid}.${randomUUID()}.tmp`);
    let fd;
    try {
        fd = fs.openSync(temp, "wx");
        fs.writeFileSync(fd, JSON.stringify([...new Set(names)].sort(), null, 2), "utf8");
        fs.closeSync(fd);
        fd = undefined;
        fs.renameSync(temp, storageFile);
    } catch (error) {
        if (fd !== undefined) { try { fs.closeSync(fd); } catch (_) {} }
        try { fs.unlinkSync(temp); } catch (_) {}
        const wrapped = new Error("Não foi possível salvar o banco de comandos VIP.");
        wrapped.cause = error;
        throw wrapped;
    }
}

function addVipCommand(name) {
    const normalized = normalizeCommandName(name);
    const names = readNames();
    if (names.includes(normalized)) return { name: normalized, alreadyPresent: true };
    names.push(normalized);
    writeNames(names);
    return { name: normalized, alreadyPresent: false };
}

function removeVipCommand(name) {
    const normalized = normalizeCommandName(name);
    const names = readNames();
    if (!names.includes(normalized)) return false;
    writeNames(names.filter(item => item !== normalized));
    return true;
}

function isVipCommand(name) {
    const normalized = normalizeCommandName(name);
    return readNames().includes(normalized);
}

function listVipCommands() { return readNames(); }

module.exports = { storageFile, normalizeCommandName, addVipCommand, removeVipCommand, isVipCommand, listVipCommands };
