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
    name: ["twitter", "xvideo", "twitter_video"],
    description: "Baixa vídeos do Twitter/X via link",
    execute: async (ctx) => {
        const link = ctx.args[0];

        if (!link || !link.startsWith("http")) {
            return replyNYX(ctx, `🐦 *BAIXAR TWITTER/X*\n\nUso: ${ctx.prefix}twitter [link do tweet]\nEx: ${ctx.prefix}twitter https://x.com/...`, "bot");
        }

        try { await ctx.react("🐦"); } catch (e) {}
        await ctx.reply("🐦 Baixando seu vídeo do Twitter/X, aguarde...");

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-x-"));

        try {
            const outputTemplate = path.join(temporario, "video.%(ext)s");
            
            // O Twitter as vezes entrega em m3u8, então forçamos o mp4 no merge
            await execFileAsync("yt-dlp", [
                "--no-warnings",
                "--format", "best[ext=mp4]/best",
                "--merge-output-format", "mp4",
                "--max-filesize", "60M",
                "-o", outputTemplate,
                link
            ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

            const arquivos = fs.readdirSync(temporario);
            const videoFile = arquivos.find(f => f.endsWith(".mp4"));

            if (!videoFile) throw new Error("Arquivo MP4 não encontrado.");

            const videoPath = path.join(temporario, videoFile);
            const videoBuffer = fs.readFileSync(videoPath);

            await sendNYXMedia(ctx.sock, ctx.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: `🐦 *Twitter/X baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);

        } catch (error) {
            console.error("[TWITTER] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui baixar esse vídeo do Twitter/X. Verifique se o tweet é público e tem vídeo.", "bot");
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};
