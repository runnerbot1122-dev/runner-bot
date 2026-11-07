const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

const execFileAsync = promisify(execFile);

module.exports = {
    name: ["baixar_audio_interno"], // Nome interno, não vai aparecer no menu
    description: "Baixa o áudio de um link",
    execute: async (ctx) => {
        const link = ctx.args[0];
        if (!link || !link.startsWith("http")) {
            return replyNYX(ctx, "❌ Envie um link válido.", "bot");
        }

        try { await ctx.react("🎵"); } catch (e) {}
        await ctx.reply("🎵 Baixando o áudio, aguarde...");

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-audio-"));

        try {
            const outputTemplate = path.join(temporario, "audio.%(ext)s");
            // -x extrai o áudio, --audio-format mp3 converte pra mp3
            await execFileAsync("yt-dlp", [
                "-x", "--audio-format", "mp3", "--audio-quality", "0",
                "-o", outputTemplate, link
            ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

            const arquivos = fs.readdirSync(temporario);
            const audioFile = arquivos.find(f => f.endsWith(".mp3"));

            if (!audioFile) throw new Error("Áudio não encontrado.");

            const audioBuffer = fs.readFileSync(path.join(temporario, audioFile));

            await sendNYXMedia(ctx.sock, ctx.chat, {
                audio: audioBuffer,
                mimetype: "audio/mpeg",
                fileName: "audio.mp3"
            }, ctx.message);

        } catch (error) {
            console.error("[AUDIO] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui baixar o áudio deste link.", "bot");
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};