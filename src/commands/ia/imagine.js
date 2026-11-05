const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { getBotName } = require("../../utils/botNameStore");

module.exports = {
    name: ["imagine", "gerarimg", "desenhar"],
    description: "Gera uma imagem usando Inteligência Artificial",
    execute: async (ctx) => {
        const prompt = ctx.args.join(" ");
        if (!prompt) {
            return replyNYX(ctx, `🎨 *GERAR IMAGEM*\n\nUso: ${ctx.prefix}imagine [descrição]\nEx: ${ctx.prefix}imagine um gato de chapéu no espaço`, "bot");
        }

        try { await ctx.react("🎨"); } catch (e) {}

        try {
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
            const buffer = Buffer.from(response.data, 'binary');

            await sendNYXMedia(ctx.sock, ctx.chat, {
                image: buffer,
                caption: `🎨 *IA IMAGEM*\n\n💬 *Prompt:* _${prompt}_\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);

        } catch (error) {
            console.error("[IMAGINE] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui gerar a imagem. Tente novamente em alguns segundos.", "bot");
        }
    }
};