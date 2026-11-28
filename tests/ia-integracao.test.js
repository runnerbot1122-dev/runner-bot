const test = require("node:test");
const assert = require("node:assert/strict");
const { cleanText, ask } = require("../src/utils/aiProviders");
const { setMode, getMode, clearMode } = require("../src/utils/aiConversation");

test("cleanText remove nulos, espaços e limita a saída", () => {
    assert.equal(cleanText("  oi\u0000  "), "oi");
    assert.equal(cleanText(null), "");
});

test("modo contínuo expira e pode ser limpo por chat e usuário", () => {
    const chat = "chat-teste";
    const sender = "sender-teste";
    setMode(chat, sender, "groq");
    assert.equal(getMode(chat, sender).provider, "groq");
    clearMode(chat, sender);
    assert.equal(getMode(chat, sender), null);
});

test("provedor sem chave retorna erro de configuração sem rede", async () => {
    const original = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    await assert.rejects(() => ask("groq", []), (error) => error.code === "not_configured");
    if (original !== undefined) process.env.GROQ_API_KEY = original;
});
