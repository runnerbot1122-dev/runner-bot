const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const execFileAsync = promisify(execFile);

module.exports = {
    name: ["togif"],
    description: "Converte uma figurinha em GIF nativo (loop)",
    execute: async (ctx) => {
        // Verifica se o usuário respondeu a alguma mensagem
        const quoted = ctx.message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted) {
            return replyNYX(ctx, `🖼️ *TOGIF*\n\nUso: Responda a uma figurinha com ${ctx.prefix}togif`, "bot");
        }

        // Verifica se a mensagem respondida é uma figurinha
        if (!quoted.stickerMessage) {
            return replyNYX(ctx, "❌ Por favor, responda a uma *figurinha* para converter.", "bot");
        }

        try { await ctx.react("🔄"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "togif-"));
        const inputWebp = path.join(temp, "input.webp");
        const outputMp4 = path.join(temp, "output.mp4");

        try {
            // Prepara o objeto da mensagem citada para download
            const quotedMsg = {
                key: {
                    remoteJid: ctx.chat,
                    id: ctx.message.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: ctx.message.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };

            // Baixa o buffer da figurinha
            const buffer = await downloadMediaMessage(
                quotedMsg,
                "buffer",
                {},
                { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
            );

            fs.writeFileSync(inputWebp, buffer);

            // Converte para MP4 (para o WhatsApp tocar como GIF nativo)
            // O scale=trunc(iw/2)*2:trunc(ih/2)*2 garante que a resolução seja par (obrigatório para MP4)
            // O pixel format yuv420p é o padrão do WhatsApp
            await execFileAsync("ffmpeg", [
                "-y",
                "-i", inputWebp,
                "-movflags", "faststart",
                "-pix_fmt", "yuv420p",
                "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
                outputMp4
            ], { timeout: 30000 });

            // Envia como Vídeo com a flag gifPlayback ativada
            await sendNYXMedia(ctx.sock, ctx.chat, { 
                video: fs.readFileSync(outputMp4), 
                mimetype: "video/mp4", 
                gifPlayback: true 
            }, ctx.message);

        } catch (error) {
            console.error("[TOGIF] Erro:", error.stderr || error.message);
            await replyNYX(ctx, "❌ Erro ao converter a figurinha em GIF.", "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};