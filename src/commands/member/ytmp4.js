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
    name: ["ytmp4", "video", "ytvideo", "baixarvideo"],
    description: "Baixa um vídeo do YouTube via link e envia no chat",
    execute: async (ctx) => {
        const link = ctx.args[0];

        if (!link || !link.startsWith("http")) {
            return replyNYX(ctx, `🎬 *BAIXAR VÍDEO*\n\nUso: ${ctx.prefix}ytmp4 [link do vídeo]\nEx: ${ctx.prefix}ytmp4 https://youtube.com/shorts/...`, "bot");
        }

        await ctx.reply("🎬 Baixando o vídeo, aguarde um instante...");

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-ytmp4-"));

        try {
            const outputTemplate = path.join(temporario, "video.%(ext)s");
            
            // Baixa o vídeo direto do link em MP4 (720p max), já forçando o codec H.264
            await execFileAsync("yt-dlp", [
                "-f", "bv*[vcodec^=avc1][height<=720]+ba[acodec^=mp4a]/b[ext=mp4]/b",
                "--merge-output-format", "mp4",
                "--max-filesize", "60M",
                "-o", outputTemplate,
                link
            ], { timeout: 180000, maxBuffer: 10 * 1024 * 1024 });

            const arquivos = fs.readdirSync(temporario);
            const videoFile = arquivos.find(f => f.endsWith(".mp4"));

            if (!videoFile) throw new Error("Arquivo MP4 não encontrado.");

            const videoPath = path.join(temporario, videoFile);
            const videoBuffer = fs.readFileSync(videoPath);

            // Envia direto, sem conversão pesada (o yt-dlp já baixou no formato certo)
            await sendNYXMedia(ctx.sock, ctx.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: `🎬 *Vídeo baixado!*\n\n_Gerado por ${getBotName()}_`
            }, ctx.message);

        } catch (error) {
            console.error("[YTMP4] Erro:", error.message);
            if (error.message.includes("File is larger than max-filesize")) {
                await replyNYX(ctx, "❌ O vídeo é muito grande (mais de 60MB). Tente um vídeo mais curto.", "bot");
            } else {
                await replyNYX(ctx, "❌ Não consegui baixar o vídeo. Verifique se o link é válido.", "bot");
            }
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};