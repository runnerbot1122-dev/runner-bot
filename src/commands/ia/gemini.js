const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

const historicos = new Map();

module.exports = {
    name: ["gemini", "ia", "gpt", "deepseek"],
    description: "Conversa com a Inteligência Artificial",
    execute: async (ctx) => {
        const pergunta = ctx.args.join(" ");
        if (!pergunta) {
            return replyNYX(ctx, `🧠 *INTELIGÊNCIA ARTIFICIAL*\n\nUso: ${ctx.prefix}gemini [sua pergunta]\nEx: ${ctx.prefix}gemini quem descobriu o brasil?`, "bot");
        }

        // COLE SUA CHAVE AQUI
        const apiKey = "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"; 
        
        if (!apiKey || apiKey.includes("SUA_CHAVE_AQUI")) {
            return replyNYX(ctx, "❌ A chave da API não foi configurada no código.", "bot");
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

            const response = await axios.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                {
                    model: "nvidia/nemotron-3.5-lightning-30b-a3b", // MODELO NOVO
                    messages: mensagens,
                    max_tokens: 300,
                    temperature: 0.7
                },
                {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    timeout: 60000
                }
            );

            const textoResposta = response.data.choices[0].message.content;

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