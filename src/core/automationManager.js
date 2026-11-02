// src/core/automationManager.js
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { getSetting } = require("../utils/groups");
const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sendNYXMedia = require("../utils/sendNYXMedia");

const execFileAsync = promisify(execFile);

// =====================================================
// HELPER DE CONVERSÃO PARA STICKER (FFMPEG)
// =====================================================

async function converterParaSticker(buffer, isVideo = false) {
    const tmpDir = os.tmpdir();
    const id = `nyx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const inputPath = path.join(tmpDir, `${id}.${isVideo ? "mp4" : "jpg"}`);
    const outputPath = path.join(tmpDir, `${id}.webp`);

    try {
        fs.writeFileSync(inputPath, buffer);

        const args = ["-y", "-i", inputPath];

        // Filtro: Redimensiona e CORTA o centro para preencher exatamente 512x512
        // Reduzido para 360x360 (o WhatsApp redimensiona e aceita, economizando muito espaço)
        const filtroCrop = "scale=512:512:force_original_aspect_ratio=increase,crop=512:512";

        if (isVideo) {
            // Vídeo: corta em 4.5s (tempo seguro), FPS 10 (mais leve), sem áudio, crop
            args.push("-t", "4.5", "-vf", `${filtroCrop},fps=10`, "-an");
        } else {
            // Imagem: apenas redimensiona e croppa
            args.push("-vf", filtroCrop);
        }

        // Argumentos de conversão para WebP (Reduzindo qualidade para caber no limite)
        args.push("-vcodec", "libwebp", "-lossless", "0", "-compression_level", "6", "-q:v", "30");
        
        // Se for vídeo, adiciona o loop para ficar animado
        if (isVideo) args.push("-loop", "0");

        args.push(outputPath);

        await execFileAsync("ffmpeg", args, { timeout: 30000 });

        const webpBuffer = fs.readFileSync(outputPath);
        return webpBuffer;
    } finally {
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch (_) {}
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch (_) {}
    }
}

/**
 * Processa todas as automações configuradas por grupo.
 * Chamado no handler.js DEPOIS das proteções e ANTES do cache anti-delete.
 */
async function processarAutomacoes({
    sock,
    m,
    chat,
    remetente,
    texto,
    isAdmin,
    prefixoAtual
}) {
    // Se for comando, NÃO executa automações (deixa o commandRunner cuidar)
    const ehComando = texto && texto.trim().startsWith(prefixoAtual);
    if (ehComando) return;

    // =====================================================
    // 1. AUTO-REPO — reply automático em mídias com legenda salva
    // =====================================================
    if (getSetting(chat, "autoRepo") === true) {
        const isImg = !!m.message?.imageMessage;
        const isVid = !!m.message?.videoMessage;
        const isDoc = !!m.message?.documentMessage;

        let legenda = null;
        if (isImg) legenda = getSetting(chat, "legendaImagem") || getSetting(chat, "legenda_imagem");
        else if (isVid) legenda = getSetting(chat, "legendaVideo") || getSetting(chat, "legenda_video");
        else if (isDoc) legenda = getSetting(chat, "legendaDocumento") || getSetting(chat, "legenda_documento");

        if (legenda) {
            try {
                const buffer = await downloadMediaMessage(m, "buffer", {}, {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                });
                const tipo = isImg ? "image" : isVid ? "video" : "document";
                const payload = { [tipo]: buffer, caption: legenda };
                if (isDoc) {
                    payload.mimetype = m.message.documentMessage.mimetype;
                    payload.fileName = m.message.documentMessage.fileName || "arquivo";
                }
                await sock.sendMessage(chat, payload, { quoted: m });
            } catch (e) {
                console.log("[autorepo] erro:", e.message);
            }
        }
    }

    // =====================================================
    // 2. AUTO-STICKER — imagem/vídeo vira figurinha automaticamente
    // =====================================================
    if (getSetting(chat, "autoSticker") === true && (m.message?.imageMessage || m.message?.videoMessage)) {
        try {
            const buffer = await downloadMediaMessage(m, "buffer", {}, {
                logger: console,
                reuploadRequest: sock.updateMediaMessage
            });

            const isVideo = !!m.message.videoMessage;
            
            // Converte a mídia usando ffmpeg
            const stickerBuffer = await converterParaSticker(buffer, isVideo);

            if (!stickerBuffer || stickerBuffer.length === 0) {
                throw new Error("buffer de sticker vazio");
            }

            // Envia usando sendNYXMedia para aplicar o "Ver Canal"
            await sendNYXMedia(sock, chat, { sticker: stickerBuffer }, m);

        } catch (e) {
            console.log("[autosticker] erro:", e.message);
        }
    }

    // =====================================================
    // 3. AUTO-FIGU — figurinha recebida é reenviada com legenda
    // =====================================================
    if (getSetting(chat, "autoFigu") === true && m.message?.stickerMessage) {
        try {
            const buffer = await downloadMediaMessage(m, "buffer", {}, {
                logger: console,
                reuploadRequest: sock.updateMediaMessage
            });
            const legenda = getSetting(chat, "legendaFigu") || "🖼️ Figurinha detectada";
            
            // Envia a figurinha via sendNYXMedia
            await sendNYXMedia(sock, chat, { sticker: buffer }, m);

            if (legenda && legenda !== "🖼️ Figurinha detectada") {
                await sock.sendMessage(chat, { text: legenda }, { quoted: m });
            }
        } catch (e) {
            console.log("[autofigu] erro:", e.message);
        }
    }

    // =====================================================
    // 4. AUTO-TOTEXT — transcrição de áudio via Whisper API
    // =====================================================
    if (
        getSetting(chat, "autoToText") === true &&
        m.message?.audioMessage &&
        process.env.WHISPER_API_URL
    ) {
        try {
            const buffer = await downloadMediaMessage(m, "buffer", {}, {
                logger: console,
                reuploadRequest: sock.updateMediaMessage
            });
            const FormData = require("form-data");
            const axios = require("axios");
            const form = new FormData();
            form.append("file", buffer, { filename: "audio.ogg" });
            form.append("model", "whisper-1");
            const { data } = await axios.post(process.env.WHISPER_API_URL, form, {
                headers: form.getHeaders()
            });
            if (data?.text) {
                await sock.sendMessage(chat, {
                    text: `🎙️ *Transcrição:*\n\n${data.text}`
                }, { quoted: m });
            }
        } catch (e) {
            console.log("[autototext] erro:", e.message);
        }
    }
}

module.exports = { processarAutomacoes };