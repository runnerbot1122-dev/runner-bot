const axios = require("axios");

const DEFAULT_TIMEOUT = 60000;
const MAX_OUTPUT = 700;

class AIProviderError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = "AIProviderError";
        this.provider = options.provider || "unknown";
        this.status = options.status || null;
        this.code = options.code || "provider_error";
        this.retryable = options.retryable !== false;
    }
}

function key(name) {
    const value = process.env[name];
    return typeof value === "string" ? value.trim() : "";
}

function model(name, fallback) {
    return key(name) || fallback;
}

function cleanText(value) {
    if (typeof value !== "string") return "";
    return value.replace(/\u0000/g, "").trim().slice(0, 4000);
}

function classify(error, provider) {
    const status = error?.response?.status || error?.status || null;
    const code = error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT"
        ? "timeout"
        : status === 401 || status === 403 ? "unauthorized"
            : status === 429 ? "rate_limit"
                : status >= 500 ? "upstream_error" : "provider_error";
    const retryable = code !== "unauthorized" && code !== "provider_error";
    const detail = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || code;
    return new AIProviderError(`${provider}: ${detail}`.slice(0, 240), { provider, status, code, retryable });
}

async function request(config, provider) {
    try {
        const response = await axios({ timeout: DEFAULT_TIMEOUT, ...config });
        return response.data;
    } catch (error) {
        throw classify(error, provider);
    }
}

function openAIMessages(messages) {
    return messages.map((item) => ({ role: item.role, content: String(item.content || "") }));
}

async function gemini(messages) {
    const apiKey = key("GEMINI_API_KEY");
    if (!apiKey) throw new AIProviderError("GEMINI_API_KEY não configurada", { provider: "gemini", code: "not_configured", retryable: false });
    const selectedModel = model("GEMINI_MODEL", "gemini-2.5-flash");
    const system = messages.find((item) => item.role === "system");
    const contents = messages.filter((item) => item.role !== "system").map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: String(item.content || "") }]
    }));
    const data = await request({
        method: "POST",
        url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent`,
        params: { key: apiKey },
        data: {
            ...(system ? { systemInstruction: { parts: [{ text: String(system.content || "") }] } } : {}),
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: MAX_OUTPUT }
        },
        headers: { Accept: "application/json" }
    }, "gemini");
    const text = cleanText(data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join(""));
    if (!text) throw new AIProviderError("Resposta vazia", { provider: "gemini", code: "empty_response" });
    return { text, provider: "gemini", model: selectedModel };
}

async function groq(messages) {
    const apiKey = key("GROQ_API_KEY");
    if (!apiKey) throw new AIProviderError("GROQ_API_KEY não configurada", { provider: "groq", code: "not_configured", retryable: false });
    const selectedModel = model("GROQ_MODEL", "llama-3.3-70b-versatile");
    const data = await request({
        method: "POST",
        url: "https://api.groq.com/openai/v1/chat/completions",
        data: { model: selectedModel, messages: openAIMessages(messages), temperature: 0.7, max_tokens: MAX_OUTPUT },
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
    }, "groq");
    const text = cleanText(data?.choices?.[0]?.message?.content);
    if (!text) throw new AIProviderError("Resposta vazia", { provider: "groq", code: "empty_response" });
    return { text, provider: "groq", model: selectedModel };
}

async function claude(messages) {
    const apiKey = key("ANTHROPIC_API_KEY");
    if (!apiKey) throw new AIProviderError("ANTHROPIC_API_KEY não configurada", { provider: "claude", code: "not_configured", retryable: false });
    const selectedModel = model("CLAUDE_MODEL", "claude-3-5-haiku-latest");
    const system = messages.find((item) => item.role === "system");
    const data = await request({
        method: "POST",
        url: "https://api.anthropic.com/v1/messages",
        data: {
            model: selectedModel,
            max_tokens: MAX_OUTPUT,
            ...(system ? { system: String(system.content || "") } : {}),
            messages: messages.filter((item) => item.role !== "system").map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: String(item.content || "") }))
        },
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" }
    }, "claude");
    const text = cleanText(data?.content?.filter((item) => item.type === "text").map((item) => item.text).join(""));
    if (!text) throw new AIProviderError("Resposta vazia", { provider: "claude", code: "empty_response" });
    return { text, provider: "claude", model: selectedModel };
}

async function openrouter(messages) {
    const apiKey = key("OPENROUTER_API_KEY");
    if (!apiKey) throw new AIProviderError("OPENROUTER_API_KEY não configurada", { provider: "openrouter", code: "not_configured", retryable: false });
    const selectedModel = model("OPENROUTER_MODEL", "openrouter/free");
    const data = await request({
        method: "POST",
        url: "https://openrouter.ai/api/v1/chat/completions",
        data: { model: selectedModel, messages: openAIMessages(messages), temperature: 0.7, max_tokens: MAX_OUTPUT },
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://github.com/runnerbot1122-dev/runner-bot", "X-Title": "Runner Bot" }
    }, "openrouter");
    const text = cleanText(data?.choices?.[0]?.message?.content);
    if (!text) throw new AIProviderError("Resposta vazia", { provider: "openrouter", code: "empty_response" });
    return { text, provider: "openrouter", model: selectedModel };
}

async function nvidia(messages) {
    const apiKey = key("NVIDIA_API_KEY");
    if (!apiKey) throw new AIProviderError("NVIDIA_API_KEY não configurada", { provider: "nvidia", code: "not_configured", retryable: false });
    const selectedModel = model("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b");
    const data = await request({
        method: "POST",
        url: "https://integrate.api.nvidia.com/v1/chat/completions",
        data: { model: selectedModel, messages: openAIMessages(messages), temperature: 0.7, max_tokens: MAX_OUTPUT },
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
    }, "nvidia");
    const text = cleanText(data?.choices?.[0]?.message?.content);
    if (!text) throw new AIProviderError("Resposta vazia", { provider: "nvidia", code: "empty_response" });
    return { text, provider: "nvidia", model: selectedModel };
}

async function ask(provider, messages) {
    const providers = { gemini, groq, claude, openrouter, nvidia };
    if (!providers[provider]) throw new AIProviderError(`Provedor desconhecido: ${provider}`, { provider, code: "unknown_provider", retryable: false });
    return providers[provider](messages);
}

async function askWithFallback(primary, messages, fallback = []) {
    const chain = [primary, ...fallback].filter((name, index, list) => name && list.indexOf(name) === index);
    const errors = [];
    for (const provider of chain) {
        try {
            return await ask(provider, messages);
        } catch (error) {
            errors.push(error);
            if (error.code === "unauthorized" || error.code === "rate_limit" || error.code === "timeout" || error.code === "upstream_error") {
                console.warn(`[IA] ${provider} indisponível (${error.code}).`);
            }
        }
    }
    const last = errors[errors.length - 1] || new AIProviderError("Nenhum provedor disponível");
    last.attempts = errors;
    throw last;
}

module.exports = { AIProviderError, ask, askWithFallback, cleanText };
