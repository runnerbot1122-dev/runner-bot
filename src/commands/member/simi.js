const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["simi", "simisimi"],
    description: "Conversa com a SimiSimi pela NexRay",
    execute: async (ctx) => {
        const texto = (ctx.args || []).join(" ").trim();

        if (!texto) {
            return replyNYX(
                ctx,
                `💬 *SIMI SIMI*\n\nUso: ${ctx.prefix}simi [mensagem]\nExemplo: ${ctx.prefix}simi oi, tudo bem?`,
                "bot"
            );
        }

        try { await ctx.react("💬"); } catch (e) {}

        try {
            const response = await axios.get("https://api.nexray.eu.cc/ai/simisimi", {
                params: { text: texto },
                timeout: 30000,
                headers: {
                    Accept: "application/json",
                    "User-Agent": "runner-bot-nexray/1.0"
                }
            });

            const resposta = response.data?.result;
            if (response.data?.status === false || typeof resposta !== "string" || !resposta.trim()) {
                throw new Error("Resposta vazia da NexRay");
            }

            await replyNYX(ctx, resposta.trim().slice(0, 4000), "bot");
            try { await ctx.react("✅"); } catch (e) {}
        } catch (error) {
            console.error("[SIMI] NexRay falhou:", error.message);
            try { await ctx.react("❌"); } catch (e) {}
            await replyNYX(ctx, "❌ A Simi não conseguiu responder agora. Tente novamente em instantes.", "bot");
        }
    }
};