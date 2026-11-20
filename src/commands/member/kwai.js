const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { getBotName } = require("../../utils/botNameStore");

const execFileAsync = promisify(execFile);
const MAX_FILE_SIZE = 60 * 1024 * 1024;

function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
        return false;
    }
}

module.exports = {
    name: ["kwai"],
    description: "Baixa um vídeo público do Kwai via link",

    execute: async ctx => {
        const link = ctx.args?.[0];

        if (!link || !isHttpUrl(link)) {
            return replyNYX(
                ctx,
                `🎞️ Envie um link válido do Kwai.\n\nUso: ${ctx.prefix}kwai https://www.kwai.com/...`,
                "bot"
            );
        }

        try {
            await ctx.react("🎞️");
        } catch (error) {}

        const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-kwai-"));
        const outputTemplate = path.join(temporary, "video.%(ext)s");

        try {
            await ctx.reply("🎞️ Baixando o vídeo do Kwai, aguarde...");

            await execFileAsync("yt-dlp", [
                "--no-warnings",
                "--no-playlist",
                "--format", "best[ext=mp4]/best",
                "--merge-output-format", "mp4",
                "--max-filesize", "60M",
                "-o", outputTemplate,
                link
            ], {
                timeout: 120000,
                maxBuffer: 10 * 1024 * 1024
            });

            const files = fs.readdirSync(temporary);
            const videoFile = files.find(file => /\.(mp4|webm|mkv)$/i.test(file));
            if (!videoFile) throw new Error("Vídeo não encontrado.");

            const videoPath = path.join(temporary, videoFile);
            const videoBuffer = fs.readFileSync(videoPath);
            if (!videoBuffer.length || videoBuffer.length > MAX_FILE_SIZE) {
                throw new Error("Vídeo vazio ou maior que 60 MB.");
            }

            await sendNYXMedia(ctx.sock, ctx.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: `🎞️ *Kwai baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);
        } catch (error) {
            console.error("[KWAI] Erro:", error.message);
            const message = error.code === "ENOENT"
                ? "❌ O yt-dlp não está instalado ou não está no PATH do PM2."
                : "❌ Não consegui baixar esse vídeo do Kwai. O link pode ser privado ou não suportado.";
            return replyNYX(ctx, message, "bot");
        } finally {
            fs.rmSync(temporary, { recursive: true, force: true });
        }
    }
};
