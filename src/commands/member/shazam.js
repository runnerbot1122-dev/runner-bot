const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const replyNYX = require("../../utils/replyNYX");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const execFileAsync = promisify(execFile);

// COLOQUE SUA CHAVE DA AUDD.IO AQUI
const AUDD_API_TOKEN = "d3a651aeb78b95c49691f526f316215e";

module.exports = {
    name: ["shazam", "qualemusica"],
    description: "Reconhece a música de um áudio",
    execute: async (ctx) => {
        const quoted = ctx.message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted || !quoted.audioMessage) {
            return replyNYX(ctx, `🎵 *SHAZAM*\n\nResponda a um *áudio* com *${ctx.prefix}shazam* para eu descobrir a música!`, "bot");
        }

        try { await ctx.react("🎧"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "shazam-"));
        const inputOgg = path.join(temp, "audio.ogg");
        const inputMp3 = path.join(temp, "audio.mp3");

        try {
            const quotedMsg = {
                key: {
                    remoteJid: ctx.chat,
                    id: ctx.message.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: ctx.message.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };

            const buffer = await downloadMediaMessage(quotedMsg, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
            fs.writeFileSync(inputOgg, buffer);

            await replyNYX(ctx, "🔍 Ouvindo e reconhecendo o áudio...", "bot");

            // Converter OGG para MP3 (formato 100% aceito pela Audd.io)
            await execFileAsync("ffmpeg", [
                "-loglevel", "error", "-y",
                "-i", inputOgg, "-c:a", "libmp3lame", "-b:a", "128k",
                inputMp3
            ], { timeout: 30000 });

            // Envia para a API Audd.io
            const form = new FormData();
            form.append("file", fs.createReadStream(inputMp3));
            form.append("api_token", AUDD_API_TOKEN);
            form.append("return", "spotify,apple_music");

            const response = await axios.post("https://api.audd.io/", form, {
                headers: form.getHeaders(),
                timeout: 30000
            });

            if (response.data && response.data.status === "success" && response.data.result) {
                const result = response.data.result;
                const titulo = result.title || "Desconhecido";
                const artista = result.artist || "Desconhecido";
                
                let link = "Não encontrado";
                if (result.spotify && result.spotify.external_urls) {
                    link = result.spotify.external_urls.spotify;
                } else if (result.song_link) {
                    link = result.song_link;
                }

                const texto = `🎵 *MÚSICA ENCONTRADA!*\n\n🎤 *Artista:* ${artista}\n🎶 *Título:* ${titulo}\n🔗 *Link:* ${link}`;
                await replyNYX(ctx, texto, "bot");
            } else {
                await replyNYX(ctx, "❌ Não consegui reconhecer essa música. Tente um áudio mais longo ou com menos ruído.", "bot");
            }

        } catch (error) {
            console.error("[SHAZAM] Erro:", error.response?.data || error.message);
            await replyNYX(ctx, "❌ Erro ao tentar reconhecer a música. Verifique o token da API.", "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};