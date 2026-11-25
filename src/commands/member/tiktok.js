const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { getBotName } = require("../../utils/botNameStore");
const { nexrayDownload } = require("../../utils/nexrayDownloader");

const execFileAsync = promisify(execFile);

module.exports = {
    name: ["tiktok", "tt", "tik", "tk-video", "tiktok_video", "tiktok_video2"],
    description: "Baixa um vídeo do TikTok via link",
    execute: async (ctx) => {
        const link = ctx.args[0];
        if (!link || !/^https?:\/\//i.test(link)) {
            return replyNYX(ctx, `📱 *BAIXAR TIKTOK*\n\nUso: ${ctx.prefix}tiktok [link do vídeo]\nEx: ${ctx.prefix}tiktok https://www.tiktok.com/...`, "bot");
        }

        try { await ctx.react("📱"); } catch (e) {}
        await ctx.reply("📱 Baixando seu TikTok, aguarde um instante...");

        // Provedor principal: NexRay.
        try {
            const media = await nexrayDownload("/downloader/tiktok", link);
            const caption = `📱 *TikTok baixado!*\n\n_Gerado por ${getBotName()}_`;
            if (media.contentType.startsWith("image/")) {
                return await sendNYXMedia(ctx.sock, ctx.chat, {
                    image: media.buffer,
                    mimetype: media.contentType,
                    caption
                }, ctx.message);
            }
            return await sendNYXMedia(ctx.sock, ctx.chat, {
                video: media.buffer,
                mimetype: media.contentType || "video/mp4",
                caption
            }, ctx.message);
        } catch (error) {
            console.error("[TIKTOK] NexRay falhou; usando yt-dlp:", error.message);
        }

        // Fallback original: yt-dlp.
        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-tiktok-"));
        try {
            const outputTemplate = path.join(temporario, "video.%(ext)s");
            await execFileAsync("yt-dlp", [
                "--no-warnings", "--format", "best", "--max-filesize", "60M",
                "-o", outputTemplate, link
            ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

            const arquivos = fs.readdirSync(temporario);
            const videoFile = arquivos.find(f => /\.(mp4|webm)$/i.test(f));
            if (!videoFile) throw new Error("Arquivo de vídeo não encontrado.");
            const videoBuffer = fs.readFileSync(path.join(temporario, videoFile));

            await sendNYXMedia(ctx.sock, ctx.chat, {
                video: videoBuffer, mimetype: "video/mp4",
                caption: `📱 *TikTok baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);
        } catch (error) {
            console.error("[TIKTOK] Erro no fallback:", error.message);
            if (error.message.includes("File is larger than max-filesize")) {
                await replyNYX(ctx, "❌ O vídeo é muito grande (mais de 60MB). Tente um vídeo mais curto.", "bot");
            } else if (error.message.includes("Unsupported URL")) {
                await replyNYX(ctx, "❌ Esse link do TikTok não é suportado. Verifique se o link está completo.", "bot");
            } else {
                await replyNYX(ctx, "❌ Não consegui baixar esse TikTok. O link pode estar privado ou o TikTok bloqueou a requisição.", "bot");
            }
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};