const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

module.exports = {
    name: ["meme", "memes"],
    description: "Envia um meme aleatório",
    execute: async (ctx) => {
        try { await ctx.react("😂"); } catch (e) {}

        const subreddits = [
            "eu_nvr",
            "MemesBrasil",
            "memesbr",
            "ShitpostBR",
            "porramauricio"
        ];

        const sub = subreddits[Math.floor(Math.random() * subreddits.length)];

        try {
            const res = await fetch(`https://meme-api.com/gimme/${sub}`);
            const data = await res.json();
            
            if (!data || !data.url) throw new Error("Sem meme");
            
            // Se for vídeo (não imagem), tenta outro pra não quebrar
            if (data.url.endsWith(".mp4") || data.url.endsWith(".gif")) {
                throw new Error("Formato não suportado"); 
            }

            const caption = `😂 *${data.title || "Meme"}*\n\n👍 ${data.ups || 0} likes\n📌 r/${sub}`;

            await sendNYXMedia(ctx.sock, ctx.chat, {
                image: { url: data.url },
                caption: caption
            }, ctx.message);
            
        } catch (e) {
            console.error("[MEME] Erro:", e.message);
            // Fallback: tenta a API em português geral
            try {
                const resFallback = await fetch("https://meme-api.com/gimme/memesbr");
                const dataFallback = await resFallback.json();
                if (dataFallback && dataFallback.url && !dataFallback.url.endsWith(".mp4")) {
                    return await sendNYXMedia(ctx.sock, ctx.chat, {
                        image: { url: dataFallback.url },
                        caption: `😂 *${dataFallback.title}*`
                    }, ctx.message);
                }
            } catch (err) {}

            await replyNYX(ctx, "❌ Não consegui buscar um meme agora. Tente novamente mais tarde.", "bot");
        }
    }
};