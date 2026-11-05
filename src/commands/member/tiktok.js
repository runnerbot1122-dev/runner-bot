const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { getBotName } = require("../../utils/botNameStore");

const execFileAsync = promisify(execFile);

module.exports = {
    name: ["tiktok", "tt", "tik", "tk-video"],
    description: "Baixa um vídeo do TikTok via link",
    execute: async (ctx) => {
        const link = ctx.args[0];

        if (!link || !link.startsWith("http")) {
            return replyNYX(ctx, `📱 *BAIXAR TIKTOK*\n\nUso: ${ctx.prefix}tiktok [link do vídeo]\nEx: ${ctx.prefix}tiktok https://www.tiktok.com/...`, "bot");
        }

        try { await ctx.react("📱"); } catch (e) {}

        await ctx.reply("📱 Baixando seu TikTok, aguarde um instante...");

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-tiktok-"));

        try {
            const outputTemplate = path.join(temporario, "video.%(ext)s");
            
            // Opções do yt-dlp para TikTok (remove marca d'água e pega a melhor qualidade)
            await execFileAsync("yt-dlp", [
                "--no-warnings",
                "--format", "best",
                "--max-filesize", "60M",
                "-o", outputTemplate,
                link
            ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

            const arquivos = fs.readdirSync(temporario);
            const videoFile = arquivos.find(f => f.endsWith(".mp4") || f.endsWith(".webm"));

            if (!videoFile) throw new Error("Arquivo de vídeo não encontrado.");

            const videoPath = path.join(temporario, videoFile);
            const videoBuffer = fs.readFileSync(videoPath);

            // Envia o vídeo
            await sendNYXMedia(ctx.sock, ctx.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: `📱 *TikTok baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);

        } catch (error) {
            console.error("[TIKTOK] Erro:", error.message);
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