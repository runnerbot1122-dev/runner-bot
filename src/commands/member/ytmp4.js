const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");
const yt = require("@denzy-official/youtube_scraper");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { getBotName } = require("../../utils/botNameStore");

module.exports = {
    name: ["ytmp4", "video", "ytvideo", "baixarvideo"],
    description: "Baixa um vídeo do YouTube via link e envia no chat",
    execute: async (ctx) => {
        const link = ctx.args[0];
        if (!link || !link.startsWith("http")) {
            return replyNYX(ctx, `🎬 *BAIXAR VÍDEO*\n\nUso: ${ctx.prefix}ytmp4 [link do vídeo]\nEx: ${ctx.prefix}ytmp4 https://youtube.com/shorts/...`, "bot");
        }

        await ctx.reply("🎬 Baixando o vídeo, aguarde um instante...");

        try {
            // 1. Pede para a API Denzy extrair o link direto do MP4
            const apiRes = await yt.ytmp4(link);
            if (!apiRes || !apiRes.download || !apiRes.download.url) {
                throw new Error("A API não retornou um link de vídeo válido.");
            }

            const videoUrl = apiRes.download.url;

            // 2. Baixa o buffer do vídeo (rápido, pois vem de um CDN)
            const videoResponse = await axios.get(videoUrl, {
                responseType: "arraybuffer",
                timeout: 60000 // 60s de timeout para vídeos maiores
            });

            const videoBuffer = Buffer.from(videoResponse.data);

            // 3. Verifica o tamanho (limite de 60 MB para não estourar o WhatsApp)
            if (videoBuffer.length > 60 * 1024 * 1024) {
                return replyNYX(ctx, "❌ O vídeo é muito grande (mais de 60MB). Tente um vídeo mais curto.", "bot");
            }

            // 4. Envia o vídeo
            await sendNYXMedia(ctx.sock, ctx.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: `🎬 *Vídeo baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);

        } catch (error) {
            console.error("[YTMP4] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui baixar o vídeo. Verifique se o link é válido.", "bot");
        }
    }
};