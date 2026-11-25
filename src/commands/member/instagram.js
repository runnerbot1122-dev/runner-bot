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

async function sendInstagramMedia(ctx, buffer, contentType) {
    if (contentType.startsWith("video/")) {
        return sendNYXMedia(ctx.sock, ctx.chat, {
            video: buffer,
            mimetype: contentType || "video/mp4",
            caption: `📸 *Instagram baixado!*\n\n_Gerado por ${getBotName()}_`
        }, ctx.message);
    }

    return sendNYXMedia(ctx.sock, ctx.chat, {
        image: buffer,
        mimetype: contentType || "image/jpeg",
        caption: `📸 *Instagram baixado!*\n\n_Gerado por ${getBotName()}_`
    }, ctx.message);
}

module.exports = {
    name: ["instagram", "insta", "ig", "reels", "instagram2", "insta_video2"],
    description: "Baixa vídeos e fotos do Instagram via link",
    execute: async (ctx) => {
        const link = ctx.args[0];

        if (!link || !/^https?:\/\//i.test(link)) {
            return replyNYX(ctx, `📸 *BAIXAR INSTAGRAM*\n\nUso: ${ctx.prefix}instagram [link do post/reel]\nEx: ${ctx.prefix}instagram https://www.instagram.com/reel/...`, "bot");
        }

        try { await ctx.react("📸"); } catch (e) {}
        await ctx.reply("📸 Baixando seu Instagram, aguarde um instante...");

        // Provedor principal: NexRay.
        try {
            const media = await nexrayDownload("/downloader/instagram", link);
            return await sendInstagramMedia(ctx, media.buffer, media.contentType);
        } catch (error) {
            console.error("[INSTAGRAM] NexRay falhou; usando yt-dlp:", error.message);
        }

        // Fallback original: yt-dlp.
        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-insta-"));
        try {
            const outputTemplate = path.join(temporario, "media.%(ext)s");
            await execFileAsync("yt-dlp", [
                "--no-warnings", "--format", "best", "--max-filesize", "60M",
                "-o", outputTemplate, link
            ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

            const arquivos = fs.readdirSync(temporario);
            const mediaFile = arquivos.find(f => /\.(mp4|jpg|jpeg|webp)$/i.test(f));
            if (!mediaFile) throw new Error("Arquivo de mídia não encontrado.");

            const mediaBuffer = fs.readFileSync(path.join(temporario, mediaFile));
            if (/\.mp4$/i.test(mediaFile)) {
                await sendNYXMedia(ctx.sock, ctx.chat, {
                    video: mediaBuffer, mimetype: "video/mp4",
                    caption: `📸 *Instagram baixado!*\n\n_Gerado por ${getBotName()}_`
                }, ctx.message);
            } else {
                await sendNYXMedia(ctx.sock, ctx.chat, {
                    image: mediaBuffer,
                    caption: `📸 *Instagram baixado!*\n\n_Gerado por ${getBotName()}_`
                }, ctx.message);
            }
        } catch (error) {
            console.error("[INSTAGRAM] Erro no fallback:", error.message);
            if (error.message.includes("File is larger than max-filesize")) {
                await replyNYX(ctx, "❌ O arquivo é muito grande (mais de 60MB). Tente um vídeo mais curto.", "bot");
            } else if (error.message.includes("Unsupported URL") || error.message.includes("Invalid URL")) {
                await replyNYX(ctx, "❌ Esse link não é suportado. Mandar link de Reels ou Post público.", "bot");
            } else if (error.message.includes("login") || error.message.includes("403")) {
                await replyNYX(ctx, "❌ O Instagram bloqueou o download. Pode ser que a conta seja privada ou o IG esteja exigindo login.", "bot");
            } else {
                await replyNYX(ctx, "❌ Não consegui baixar esse link do Instagram. Verifique se o post é público.", "bot");
            }
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};