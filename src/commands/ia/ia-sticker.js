const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

module.exports = {
    name: ["ia-sticker", "iasticker", "iafig", "figia"],
    description: "Gera uma figurinha usando Inteligência Artificial",
    execute: async (ctx) => {
        const prompt = ctx.args.join(" ");
        if (!prompt) {
            return replyNYX(ctx, `🎨 *FIGURINHA IA*\n\nUso: ${ctx.prefix}ia-sticker [descrição]\nEx: ${ctx.prefix}ia-sticker um gato samurai`, "bot");
        }

        try { await ctx.react("🎨"); } catch (e) {}

        try {
            // 1. Gera a imagem com a IA
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
            const bufferOriginal = Buffer.from(response.data, 'binary');

            if (!bufferOriginal || bufferOriginal.length === 0) throw new Error("Imagem vazia.");

            // 2. Transforma em figurinha usando o sharp
            const sharp = require("sharp");
            const figurinha = await sharp(bufferOriginal)
                .resize(512, 512, {
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 80 })
                .toBuffer();

            // 3. Envia
            await sendNYXMedia(ctx.sock, ctx.chat, { sticker: figurinha }, ctx.message);

        } catch (error) {
            console.error("[IA-STICKER] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui gerar a figurinha. Tente novamente em alguns segundos.", "bot");
        }
    }
};