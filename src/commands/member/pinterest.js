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
    name: ["pinterest", "pin"],
    description: "Baixa vídeos e imagens do Pinterest",
    execute: async (ctx) => {
        const link = ctx.args[0];
        if (!link || !link.startsWith("http")) return replyNYX(ctx, `📌 *BAIXAR PINTEREST*\n\nUso: ${ctx.prefix}pinterest [link]\nEx: ${ctx.prefix}pinterest https://pin.it/...`, "bot");

        try { await ctx.react("📌"); } catch (e) {}
        await ctx.reply("📌 Baixando do Pinterest, aguarde...");

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-pin-"));

        try {
            const outputTemplate = path.join(temporario, "media.%(ext)s");
            await execFileAsync("yt-dlp", [
                "--no-warnings", "--format", "best", "--max-filesize", "60M",
                "-o", outputTemplate, link
            ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

            const arquivos = fs.readdirSync(temporario);
            const mediaFile = arquivos.find(f => f.endsWith(".mp4") || f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".webp"));
            if (!mediaFile) throw new Error("Arquivo não encontrado.");

            const mediaPath = path.join(temporario, mediaFile);
            const buffer = fs.readFileSync(mediaPath);

            if (mediaFile.endsWith(".mp4")) {
                await sendNYXMedia(ctx.sock, ctx.chat, { video: buffer, mimetype: "video/mp4", caption: `📌 *Pinterest baixado!*\n\n_Gerado por ${getBotName()}_` }, ctx.message);
            } else {
                await sendNYXMedia(ctx.sock, ctx.chat, { image: buffer, caption: `📌 *Pinterest baixado!*\n\n_Gerado por ${getBotName()}_` }, ctx.message);
            }
        } catch (error) {
            console.error("[PINTEREST] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui baixar esse link do Pinterest.", "bot");
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};