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
    name: ["instagram", "insta", "ig", "reels", "instagram2", "insta_video2"],
    description: "Baixa vídeos e fotos do Instagram via link",
    execute: async (ctx) => {
        const link = ctx.args[0];

        if (!link || !link.startsWith("http")) {
            return replyNYX(ctx, `📸 *BAIXAR INSTAGRAM*\n\nUso: ${ctx.prefix}instagram [link do post/reel]\nEx: ${ctx.prefix}instagram https://www.instagram.com/reel/...`, "bot");
        }

        try { await ctx.react("📸"); } catch (e) {}

        await ctx.reply("📸 Baixando seu Instagram, aguarde um instante...");

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-insta-"));

        try {
            const outputTemplate = path.join(temporario, "media.%(ext)s");
            
            // Opções do yt-dlp para Instagram (pega o melhor formato e tenta burlar bloqueio básico)
            await execFileAsync("yt-dlp", [
                "--no-warnings",
                "--format", "best",
                "--max-filesize", "60M",
                "-o", outputTemplate,
                link
            ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

            const arquivos = fs.readdirSync(temporario);
            // Pega o primeiro arquivo de mídia que encontrar
            const mediaFile = arquivos.find(f => f.endsWith(".mp4") || f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".webp"));

            if (!mediaFile) throw new Error("Arquivo de mídia não encontrado.");

            const mediaPath = path.join(temporario, mediaFile);
            const mediaBuffer = fs.readFileSync(mediaPath);

            if (mediaFile.endsWith(".mp4")) {
                // Se for vídeo (Reels), envia como vídeo
                await sendNYXMedia(ctx.sock, ctx.chat, {
                    video: mediaBuffer,
                    mimetype: "video/mp4",
                    caption: `📸 *Instagram baixado!*\n\n_Gerado por ${getBotName()}_`
                }, ctx.message);
            } else {
                // Se for foto, envia como imagem
                await sendNYXMedia(ctx.sock, ctx.chat, {
                    image: mediaBuffer,
                    caption: `📸 *Instagram baixado!*\n\n_Gerado por ${getBotName()}_`
                }, ctx.message);
            }

        } catch (error) {
            console.error("[INSTAGRAM] Erro:", error.message);
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
