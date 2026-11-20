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
    name: ["kwai"],
    description: "Baixa vídeos do Kwai",
    execute: async (ctx) => {
        const link = ctx.args[0];
        if (!link || !link.startsWith("http")) return replyNYX(ctx, `🎬 *BAIXAR KWAI*\n\nUso: ${ctx.prefix}kwai [link]\nEx: ${ctx.prefix}kwai https://kwai.com/...`, "bot");

        try { await ctx.react("🎬"); } catch (e) {}
        await ctx.reply("🎬 Baixando do Kwai, aguarde...");

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-kwai-"));

        try {
            const outputTemplate = path.join(temporario, "video.%(ext)s");
            await execFileAsync("yt-dlp", [
                "--no-warnings", "--format", "best[ext=mp4]/best", "--max-filesize", "60M",
                "-o", outputTemplate, link
            ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

            const arquivos = fs.readdirSync(temporario);
            const videoFile = arquivos.find(f => f.endsWith(".mp4"));
            if (!videoFile) throw new Error("Vídeo não encontrado.");

            const videoPath = path.join(temporario, videoFile);
            const videoBuffer = fs.readFileSync(videoPath);

            await sendNYXMedia(ctx.sock, ctx.chat, { video: videoBuffer, mimetype: "video/mp4", caption: `🎬 *Kwai baixado!*\n\n_Gerado por ${getBotName()}_` }, ctx.message);
        } catch (error) {
            console.error("[KWAI] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui baixar esse vídeo do Kwai.", "bot");
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};