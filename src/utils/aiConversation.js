const { askWithFallback } = require("./aiProviders");
const replyNYX = require("./replyNYX");

const histories = new Map();
const modes = new Map();
const TTL = 10 * 60 * 1000;
const MAX_MESSAGES = 6;

function conversationKey(chat, sender, provider) {
    return `${chat}:${sender}:${provider}`;
}

function modeKey(chat, sender) {
    return `${chat}:${sender}`;
}

function getMode(chat, sender) {
    const value = modes.get(modeKey(chat, sender));
    if (!value || value.expiresAt <= Date.now()) {
        modes.delete(modeKey(chat, sender));
        return null;
    }
    return value;
}

function setMode(chat, sender, provider = "gemini") {
    modes.set(modeKey(chat, sender), { provider, enabledAt: Date.now(), expiresAt: Date.now() + TTL });
    return modes.get(modeKey(chat, sender));
}

function clearMode(chat, sender) {
    modes.delete(modeKey(chat, sender));
    clearHistory(chat, sender);
}

function clearHistory(chat, sender, provider = null) {
    const prefix = `${chat}:${sender}:`;
    let removed = 0;
    for (const key of histories.keys()) {
        if (key.startsWith(prefix) && (!provider || key === `${prefix}${provider}`)) {
            histories.delete(key);
            removed++;
        }
    }
    return removed;
}

function getHistoryInfo(chat, sender, provider = null) {
    const prefix = `${chat}:${sender}:`;
    let messages = 0;
    const providers = [];
    for (const [key, history] of histories.entries()) {
        if (key.startsWith(prefix) && (!provider || key === `${prefix}${provider}`)) {
            messages += history.length;
            providers.push(key.slice(prefix.length));
        }
    }
    return { messages, providers: [...new Set(providers)] };
}

function resetExpired(history) {
    if (!history?.length) return [];
    const last = history[history.length - 1];
    return Date.now() - last.timestamp > TTL ? [] : history;
}

async function askConversation({ chat, sender, provider, text, system, fallback = [] }) {
    const historyKey = conversationKey(chat, sender, provider);
    let history = resetExpired(histories.get(historyKey) || []);
    const messages = [
        { role: "system", content: system || "Você é uma assistente virtual. Responda em português brasileiro, de forma clara e direta." },
        ...history.map((item) => ({ role: item.role, content: item.text })),
        { role: "user", content: text }
    ];
    const result = await askWithFallback(provider, messages, fallback);
    history.push({ role: "user", text, timestamp: Date.now() });
    history.push({ role: "assistant", text: result.text, timestamp: Date.now() });
    histories.set(historyKey, history.slice(-MAX_MESSAGES));
    return result;
}

async function processContinuousMessage({ sock, message, chat, sender, text }) {
    const active = getMode(chat, sender);
    if (!active || !String(text || "").trim()) return false;
    try {
        const result = await askConversation({
            chat,
            sender,
            provider: active.provider,
            text: String(text).trim(),
            fallback: ["openrouter", "nvidia"],
            system: "Você é a assistente virtual do Runner Bot. Responda em português brasileiro, de forma clara, amigável e direta."
        });
        await replyNYX({ sock, chat, message, sender }, result.text, "bot");
    } catch (error) {
        console.error(`[IA:modoia:${active.provider}]`, error.message);
        const messageText = error.code === "rate_limit"
            ? "❌ O limite temporário da IA foi atingido. Tente novamente mais tarde."
            : error.code === "not_configured"
                ? "❌ Nenhuma chave de IA está configurada para o modo contínuo."
                : "❌ A IA não conseguiu responder agora.";
        await replyNYX({ sock, chat, message, sender }, messageText, "bot");
    }
    return true;
}

module.exports = { askConversation, getMode, setMode, clearMode, clearHistory, getHistoryInfo, processContinuousMessage, TTL };
