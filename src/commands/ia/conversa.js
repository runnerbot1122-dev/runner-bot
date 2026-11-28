const replyNYX = require("../../utils/replyNYX");
const { askConversation } = require("../../utils/aiConversation");

const CONFIG = {
    gemini: { label: "Gemini", fallback: ["openrouter", "nvidia"] },
    groq: { label: "Groq", fallback: ["openrouter", "nvidia"] },
    claude: { label: "Claude", fallback: ["openrouter", "nvidia"] }
};

function usage(ctx, command, label) {
    return replyNYX(ctx, `🧠 *${label.toUpperCase()}*\n\nUso: ${ctx.prefix}${command} sua pergunta\nExemplo: ${ctx.prefix}${command} explique como funciona o bot`, "bot");
}

async function executarConversa(ctx, provider, command) {
    const text = ctx.args.join(" ").trim();
    const config = CONFIG[provider];
    if (!text) return usage(ctx, command, config.label);
    try { await ctx.react("🤖"); } catch (_) {}
    try {
        const result = await askConversation({
            chat: ctx.chat,
            sender: ctx.sender,
            provider,
            text,
            fallback: config.fallback,
            system: `Você é a assistente ${config.label} do Runner Bot. Responda em português brasileiro, com clareza, sem inventar recursos do bot e preferindo respostas curtas.`
        });
        await replyNYX(ctx, `╔═━✰『 🤖 ${config.label.toUpperCase()} 』═━✰\n\n${result.text}\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━✰`, "bot");
    } catch (error) {
        console.error(`[IA:${provider}]`, error.message);
        let message = "A IA está indisponível no momento.";
        if (error.code === "not_configured") message = `Nenhuma chave válida foi configurada para ${config.label} nem para os fallbacks.`;
        else if (error.code === "unauthorized") message = `A chave do provedor ${config.label} foi recusada.`;
        else if (error.code === "rate_limit") message = `O limite temporário do provedor ${config.label} foi atingido. Tente novamente mais tarde.`;
        await replyNYX(ctx, `❌ ${message}`, "bot");
    }
}

module.exports = { executarConversa };
