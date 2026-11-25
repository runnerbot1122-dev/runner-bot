const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const axios = require("axios");
const yt = require("@denzy-official/youtube_scraper");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { getBotName } = require("../../utils/botNameStore");
const { nexrayDownload } = require("../../utils/nexrayDownloader");
const { ytdlLocal } = require("../../utils/ytdlLocal");

const MAX_FILE_SIZE = 60 * 1024 * 1024;
const execFileAsync = promisify(execFile);

module.exports = {
    name: ["ytmp4", "video", "ytvideo", "baixarvideo"],
    description: "Baixa um vídeo do YouTube via link e envia no chat",
    execute: async (ctx) => {
        const link = ctx.args[0];
        if (!link || !/^https?:\/\//i.test(link)) {
            return replyNYX(ctx, `🎬 *BAIXAR VÍDEO*\n\nUso: ${ctx.prefix}ytmp4 [link do vídeo]\nEx: ${ctx.prefix}ytmp4 https://youtube.com/shorts/...`, "bot");
        }

        await ctx.reply("🎬 Baixando o vídeo, aguarde um instante...");

        // Provedor principal: NexRay. Todas as alternativas continuam dentro da NexRay.
        const nexrayRoutes = [
            { route: "/downloader/ytmp4", params: { url: link } },
            { route: "/downloader/v1/ytmp4", params: { url: link } },
            { route: "/downloader/savetube", params: { url: link } },
            { route: "/downloader/ytplayvid", params: { q: link } }
        ];

        for (const option of nexrayRoutes) {
            try {
                const media = await nexrayDownload(option.route, link, {
                    params: option.params,
                    maxRetries: 1
                });
                console.log(`[YTMP4] Download concluído via NexRay ${option.route}`);
                return await sendNYXMedia(ctx.sock, ctx.chat, {
                    video: media.buffer,
                    mimetype: media.contentType || "video/mp4",
                    caption: `🎬 *Vídeo baixado!*\n\n_Gerado por ${getBotName()}_`
                }, ctx.message);
            } catch (error) {
                console.error(`[YTMP4] NexRay ${option.route} falhou:`, error.message);
            }
        }

        // Fallback local portado do bot de referência: conversor ytdl sem chave Firefly.
        try {
            const local = await ytdlLocal(link, "mp4");
            if (!local?.status || !local?.dl) throw new Error(local?.mess || "Scraper local não retornou URL");

            const videoResponse = await axios.get(local.dl, {
                responseType: "arraybuffer", timeout: 120000,
                maxContentLength: MAX_FILE_SIZE, maxBodyLength: MAX_FILE_SIZE
            });
            const videoBuffer = Buffer.from(videoResponse.data);
            if (!videoBuffer.length || videoBuffer.length > MAX_FILE_SIZE) {
                throw new Error("O vídeo excede 60 MB.");
            }

            console.log("[YTMP4] Download concluído via scraper local do bot de referência");
            return await sendNYXMedia(ctx.sock, ctx.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: `🎬 *Vídeo baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);
        } catch (error) {
            console.error("[YTMP4] Scraper local do referência falhou:", error.message);
        }

        // Fallback anterior: scraper Denzy + download direto.
        try {
            const apiRes = await yt.ytmp4(link);
            if (!apiRes || !apiRes.download || !apiRes.download.url) {
                throw new Error("A API não retornou um link de vídeo válido.");
            }

            const videoResponse = await axios.get(apiRes.download.url, {
                responseType: "arraybuffer", timeout: 60000,
                maxContentLength: MAX_FILE_SIZE, maxBodyLength: MAX_FILE_SIZE
            });
            const videoBuffer = Buffer.from(videoResponse.data);
            if (!videoBuffer.length || videoBuffer.length > MAX_FILE_SIZE) {
                return replyNYX(ctx, "❌ O vídeo é muito grande (mais de 60MB). Tente um vídeo mais curto.", "bot");
            }

            console.log("[YTMP4] Download concluído via scraper Denzy");
            return await sendNYXMedia(ctx.sock, ctx.chat, {
                video: videoBuffer,
                mimetype: String(videoResponse.headers["content-type"] || "video/mp4"),
                caption: `🎬 *Vídeo baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);
        } catch (error) {
            console.error("[YTMP4] Erro no fallback:", error.message);
        }

        // Último fallback: yt-dlp local, independente da NexRay e do scraper Denzy.
        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-ytmp4-"));
        try {
            const outputTemplate = path.join(temporario, "video.%(ext)s");
            await execFileAsync("yt-dlp", [
                "--no-warnings", "--format", "best[ext=mp4]/best",
                "--max-filesize", "60M", "-o", outputTemplate, link
            ], { timeout: 180000, maxBuffer: 10 * 1024 * 1024 });

            const videoFile = fs.readdirSync(temporario).find(file => /\.(mp4|webm|mkv)$/i.test(file));
            if (!videoFile) throw new Error("yt-dlp não gerou um arquivo de vídeo.");
            const videoBuffer = fs.readFileSync(path.join(temporario, videoFile));
            if (!videoBuffer.length || videoBuffer.length > MAX_FILE_SIZE) {
                throw new Error("O vídeo excede 60 MB.");
            }

            console.log("[YTMP4] Download concluído via yt-dlp");
            return await sendNYXMedia(ctx.sock, ctx.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: `🎬 *Vídeo baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);
        } catch (error) {
            console.error("[YTMP4] Erro no yt-dlp:", error.message);
            return replyNYX(ctx, "❌ Não consegui baixar o vídeo. A NexRay, o serviço alternativo e o yt-dlp falharam; verifique se o link é público.", "bot");
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};