const { randomUUID } = require("crypto");
const database = require("../database/database");

const MAX_TASKS_PER_OWNER = 20;
const MAX_DELAY_MS = 30 * 24 * 60 * 60 * 1000;
const RETRY_DELAY_MS = 30 * 1000;
const sockets = new Map();
let timer = null;
let processing = false;

function agora() {
    return Date.now();
}

function tarefas() {
    const banco = database.scheduledTasks;
    if (!banco || typeof banco !== "object" || Array.isArray(banco)) {
        database.scheduledTasks = {};
    }
    return database.scheduledTasks;
}

function persistir() {
    database.saveScheduledTasks();
}

function normalizarTarefas() {
    const banco = tarefas();
    let alterado = false;
    for (const [id, tarefa] of Object.entries(banco)) {
        if (!tarefa || typeof tarefa !== "object") {
            delete banco[id];
            alterado = true;
            continue;
        }
        if (tarefa.status === "sending") {
            tarefa.status = "pending";
            alterado = true;
        }
        if (!tarefa.status) {
            tarefa.status = "pending";
            alterado = true;
        }
        if (!Number.isFinite(Number(tarefa.dueAt))) {
            delete banco[id];
            alterado = true;
        }
    }
    if (alterado) persistir();
}

function parseDuration(valor) {
    const texto = String(valor || "").trim().toLowerCase();
    const match = texto.match(/^(\d+)(s|m|h)$/);
    if (!match) return null;
    const numero = Number(match[1]);
    const multiplicadores = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000 };
    const ms = numero * multiplicadores[match[2]];
    if (!Number.isSafeInteger(ms) || ms < 1000 || ms > MAX_DELAY_MS) return null;
    return ms;
}

function formatDuration(ms) {
    const segundos = Math.max(0, Math.round(Number(ms) / 1000));
    if (segundos < 60) return `${segundos}s`;
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return minutosRestantes ? `${horas}h ${minutosRestantes}m` : `${horas}h`;
}

function gerarId() {
    return `lm-${randomUUID().slice(0, 8)}`;
}

function socketDaTarefa(tarefa) {
    if (tarefa.sessionId && sockets.has(tarefa.sessionId)) {
        return sockets.get(tarefa.sessionId);
    }
    if (!tarefa.sessionId && sockets.size === 1) {
        return sockets.values().next().value;
    }
    return null;
}

function proximoVencimento() {
    const agoraAtual = agora();
    return Object.values(tarefas())
        .filter(tarefa => tarefa?.status === "pending")
        .map(tarefa => Math.max(agoraAtual, Number(tarefa.nextAttemptAt || tarefa.dueAt)))
        .filter(Number.isFinite)
        .sort((a, b) => a - b)[0] || null;
}

function agendarProximo() {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    const vencimento = proximoVencimento();
    if (vencimento === null) return;
    const atraso = Math.max(0, Math.min(vencimento - agora(), 2 ** 31 - 1));
    timer = setTimeout(() => {
        timer = null;
        processarTarefas().catch(error => {
            console.error("[SCHEDULER] Falha ao processar tarefas:", error.message);
            agendarProximo();
        });
    }, atraso);
}

async function processarTarefas() {
    if (processing) return;
    processing = true;
    try {
        const agoraAtual = agora();
        const banco = tarefas();
        for (const tarefa of Object.values(banco)) {
            if (tarefa?.status !== "pending") continue;
            const tentativaEm = Number(tarefa.nextAttemptAt || tarefa.dueAt);
            if (!Number.isFinite(tentativaEm) || tentativaEm > agoraAtual) continue;
            const sock = socketDaTarefa(tarefa);
            if (!sock || typeof sock.sendMessage !== "function") {
                tarefa.nextAttemptAt = agoraAtual + RETRY_DELAY_MS;
                continue;
            }
            tarefa.status = "sending";
            tarefa.attempts = Number(tarefa.attempts || 0) + 1;
            tarefa.lastAttemptAt = agoraAtual;
            persistir();
            try {
                const numero = String(tarefa.sender || "").split("@")[0];
                await sock.sendMessage(tarefa.chat, {
                    text: `⏰ *LEMBRETE!*

${numero ? `@${numero}, ` : ""}você me pediu para lembrar:

📌 *${tarefa.text}*`,
                    mentions: tarefa.sender ? [tarefa.sender] : []
                });
                delete banco[tarefa.id];
                persistir();
            } catch (error) {
                tarefa.status = "pending";
                tarefa.nextAttemptAt = agoraAtual + RETRY_DELAY_MS;
                tarefa.lastError = String(error?.message || error);
                persistir();
                console.error(`[SCHEDULER] Falha ao enviar ${tarefa.id}:`, tarefa.lastError);
            }
        }
    } finally {
        processing = false;
        agendarProximo();
    }
}

function registerSession(sessionId, sock) {
    if (!sessionId || !sock) return;
    sockets.set(String(sessionId), sock);
    processarTarefas().catch(error => console.error("[SCHEDULER] Falha ao restaurar tarefas:", error.message));
    agendarProximo();
}

function unregisterSession(sessionId, sock) {
    const atual = sockets.get(String(sessionId));
    if (!sock || atual === sock) sockets.delete(String(sessionId));
    agendarProximo();
}

function countOwnerTasks(chat, sender) {
    return Object.values(tarefas()).filter(tarefa =>
        tarefa?.status === "pending" && tarefa.chat === chat && tarefa.sender === sender
    ).length;
}

function createTask({ chat, sender, text, delayMs, sessionId }) {
    if (!chat || !sender || !String(text || "").trim()) {
        throw new Error("DADOS_INVALIDOS");
    }
    if (!Number.isFinite(delayMs) || delayMs < 1000 || delayMs > MAX_DELAY_MS) {
        throw new Error("TEMPO_INVALIDO");
    }
    if (countOwnerTasks(chat, sender) >= MAX_TASKS_PER_OWNER) {
        throw new Error("LIMITE_TAREFAS");
    }
    const id = gerarId();
    const momento = agora();
    tarefas()[id] = {
        id,
        chat,
        sender,
        sessionId: sessionId || null,
        text: String(text).trim().slice(0, 1000),
        createdAt: momento,
        dueAt: momento + delayMs,
        nextAttemptAt: momento + delayMs,
        status: "pending",
        attempts: 0
    };
    persistir();
    agendarProximo();
    return tarefas()[id];
}

function listTasks(chat, sender) {
    return Object.values(tarefas())
        .filter(tarefa => tarefa?.status === "pending" && tarefa.chat === chat && tarefa.sender === sender)
        .sort((a, b) => Number(a.dueAt) - Number(b.dueAt));
}

function canManageTask(tarefa, { chat, sender, isAdmin, isOwner } = {}) {
    return tarefa && tarefa.chat === chat && (tarefa.sender === sender || isAdmin || isOwner);
}

function cancelTask(id, contexto) {
    const tarefa = tarefas()[String(id || "").trim()];
    if (!canManageTask(tarefa, contexto)) return { found: false, unauthorized: Boolean(tarefa) };
    delete tarefas()[tarefa.id];
    persistir();
    agendarProximo();
    return { found: true, task: tarefa };
}

normalizarTarefas();
agendarProximo();

module.exports = {
    MAX_DELAY_MS,
    MAX_TASKS_PER_OWNER,
    parseDuration,
    formatDuration,
    createTask,
    listTasks,
    cancelTask,
    registerSession,
    unregisterSession,
    processarTarefas
};
