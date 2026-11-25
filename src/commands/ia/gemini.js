const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

const historicos = new Map();
const NEXRAY_GEMINI_URL = "https://api.nexray.web.id/ai/gemini";
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

module.exports = {
    name: ["gemini", "ia", "gpt", "deepseek"],
    description: "Conversa com a Inteligência Artificial",
    execute: async (ctx) => {
        const pergunta = ctx.args.join(" ");
        if (!pergunta) {
            return replyNYX(ctx, `🧠 *INTELIGÊNCIA ARTIFICIAL*\n\nUso: ${ctx.prefix}gemini [sua pergunta]\nEx: ${ctx.prefix}gemini quem descobriu o brasil?`, "bot");
        }

        try { await ctx.react("🤖"); } catch (e) {}

        try {
            const chaveHistorico = `${ctx.chat}_${ctx.sender}`;
            let chatHistory = historicos.get(chaveHistorico) || [];
            
            if (chatHistory.length > 0 && Date.now() - chatHistory[chatHistory.length - 1].timestamp > 10 * 60 * 1000) {
                chatHistory = [];
            }

            const mensagens = [
                { role: "system", content: "Você é a NYX, uma assistente virtual. Responda de forma curta, direta e em português." },
                ...chatHistory.map(h => ({ role: h.role, content: h.text })),
                { role: "user", content: pergunta }
            ];

            let textoResposta;

            try {
                const contexto = mensagens
                    .map(mensagem => `${mensagem.role === "user" ? "Usuário" : "NYX"}: ${mensagem.content}`)
                    .join("\n");

                const response = await axios.get(NEXRAY_GEMINI_URL, {
                    params: { text: contexto },
                    timeout: 30000,
                    maxContentLength: 2 * 1024 * 1024,
                    validateStatus: () => true,
                    headers: {
                        Accept: "application/json",
                        "User-Agent": "runner-bot-nexray/1.0"
                    }
                });

                const result = response.data?.result;
                const textoNexray = typeof result === "string" ? result : result?.text;

                if (response.status < 200 || response.status >= 300 || response.data?.status === false || !textoNexray) {
                    throw new Error(`NexRay HTTP ${response.status}`);
                }

                textoResposta = textoNexray;
                console.log("[IA] Resposta obtida pela NexRay.");
            } catch (nexrayError) {
                console.warn("[IA] NexRay indisponível:", nexrayError.message);

                const apiKey = process.env.NVIDIA_API_KEY?.trim();
                if (!apiKey) {
                    throw new Error("NexRay indisponível e NVIDIA_API_KEY não configurada");
                }

                const response = await axios.post(
                    NVIDIA_URL,
                    {
                        model: "nvidia/nemotron-3.5-lightning-30b-a3b",
                        messages: mensagens,
                        max_tokens: 300,
                        temperature: 0.7
                    },
                    {
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json"
                        },
                        timeout: 60000,
                        maxContentLength: 2 * 1024 * 1024
                    }
                );

                textoResposta = response.data?.choices?.[0]?.message?.content;
                if (!textoResposta) throw new Error("Resposta vazia da NVIDIA");
                console.log("[IA] Resposta obtida pela NVIDIA (fallback).");
            }

            chatHistory.push({ role: "user", text: pergunta, timestamp: Date.now() });
            chatHistory.push({ role: "assistant", text: textoResposta, timestamp: Date.now() });
            if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);
            historicos.set(chaveHistorico, chatHistory);

            const respostaFinal = textoResposta.length > 4000 
                ? textoResposta.substring(0, 4000) + "..." 
                : textoResposta;

            const texto = 
`╔═━✰『 🤖 ɴʏx ᴀɪ 』═━✰

║╎⊹ ࣪ ˖ 💬 ▸ *Pergunta:* _${pergunta}_

║╎⊹ ࣪ ˖ 🧠 ▸ *Resposta:*
${respostaFinal}

╚═━═━═━┫ ᴅᴇᴠ ᴇᴢ ┣━✰`;

            await replyNYX(ctx, texto, "bot");

        } catch (error) {
            console.error("[IA] Erro:", error.message);
            const msgErro = error.response?.data?.error?.message || error.message;
            await replyNYX(ctx, `❌ A IA falhou. Tente novamente mais tarde.\n\n_Erro: ${msgErro.substring(0, 100)}_`, "bot");
        }
    }
};