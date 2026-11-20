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
    name: ["facebook", "fb", "face", "face_video"],
    description: "Baixa vídeos do Facebook via link",
    execute: async (ctx) => {
        const link = ctx.args[0];

        if (!link || !link.startsWith("http")) {
            return replyNYX(ctx, `📘 *BAIXAR FACEBOOK*\n\nUso: ${ctx.prefix}facebook [link do vídeo]\nEx: ${ctx.prefix}facebook https://fb.watch/...`, "bot");
        }

        try { await ctx.react("📘"); } catch (e) {}
        await ctx.reply("📘 Baixando seu vídeo do Facebook, aguarde...");

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-fb-"));

        try {
            const outputTemplate = path.join(temporario, "video.%(ext)s");
            
            await execFileAsync("yt-dlp", [
                "--no-warnings",
                "--format", "best[ext=mp4]/best",
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
                caption: `📘 *Facebook baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);

        } catch (error) {
            console.error("[FACEBOOK] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui baixar esse vídeo do Facebook. Verifique se o link é público.", "bot");
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};