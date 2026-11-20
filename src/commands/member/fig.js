const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const replyNYX = require("../../utils/replyNYX");

const execFileAsync = promisify(execFile);
const MAX_VIDEO_SECONDS = 10;
let ultimaFrase = -1;

function desembrulharMensagem(mensagem) {
    let atual = mensagem;
    while (atual?.viewOnceMessage || atual?.viewOnceMessageV2 || atual?.documentWithCaptionMessage) {
        atual = atual.viewOnceMessage || atual.viewOnceMessageV2 || atual.documentWithCaptionMessage;
        atual = atual?.message || atual;
    }
    return atual || {};
}

function localizarMidia(mensagem) {
    const atual = desembrulharMensagem(mensagem?.message || mensagem);
    if (atual.imageMessage) return { tipo: "image", conteudo: atual.imageMessage };
    if (atual.videoMessage) return { tipo: "video", conteudo: atual.videoMessage };
    
    const citada = desembrulharMensagem(atual.extendedTextMessage?.contextInfo?.quotedMessage);
    if (citada.imageMessage) return { tipo: "image", conteudo: citada.imageMessage };
    if (citada.videoMessage) return { tipo: "video", conteudo: citada.videoMessage };
    
    return null;
}

async function converterParaFigurinha(entrada, saida, tipo, bufferOriginal) {
    if (tipo === "image") {
        const sharp = require("sharp");
        return await sharp(bufferOriginal)
            .resize(512, 512, {
                fit: "contain",
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp({ quality: 80 })
            .toBuffer();
    } else {
        // Filtro à prova de falhas pro ffmpeg no Termux (Estilo Cover)
        const filtro = "scale=512:512:force_original_aspect_ratio=increase,crop=512:512";
        const argumentos = [
            "-y", "-i", entrada, 
            "-t", String(MAX_VIDEO_SECONDS), 
            "-vf", `${filtro},fps=15`, 
            "-an", 
            "-vcodec", "libwebp", 
            "-lossless", "0", 
            "-compression_level", "6", 
            "-q:v", "50", 
            "-loop", "0", 
            saida
        ];
        await execFileAsync("ffmpeg", argumentos, { maxBuffer: 1024 * 1024 * 5 });
        return fs.readFileSync(saida);
    }
}

module.exports = {
    name: ["fig", "sticker", "st", "stk", "fsticker", "figvideo"],
    description: "Cria uma figurinha a partir de imagem ou vídeo curto",
    execute: async (ctx) => {
        const midia = localizarMidia(ctx.message);
        
        if (!midia) {
            return replyNYX(ctx, `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🖼️ ▸ ʀᴇsᴘᴏɴᴅᴀ ᴀ ᴜᴍᴀ ɪᴍᴀɢᴇᴍ ᴏᴜ ᴠíᴅᴇᴏ ᴅᴇ ᴀᴛé ${MAX_VIDEO_SECONDS}s ᴄᴏᴍ *${ctx.prefix}fig*.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
        }
        
        if (midia.tipo === "video" && Number(midia.conteudo.seconds) > MAX_VIDEO_SECONDS) {
            return replyNYX(ctx, `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ ⏱️ ▸ ᴏ ᴠíᴅᴇᴏ ᴘʀᴇᴄɪsᴀ ᴛᴇʀ ɴᴏ ᴍáxɪᴍᴏ ${MAX_VIDEO_SECONDS} sᴇɢᴜɴᴅᴏs.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
        }

        const frasesPreparacao = [
            "🛠️ Só um momento, já vou enviar sua figurinha.",
            "🛠️ Estou preparando sua figurinha, aguarde.",
            "🛠️ Convertendo sua mídia em figurinha. Já vai!",
            "🛠️ Sua figurinha está quase pronta...",
            "🎨 Cortando e colando os pedaços..."
        ];
        
        let indice;
        do { indice = Math.floor(Math.random() * frasesPreparacao.length); } while (frasesPreparacao.length > 1 && indice === ultimaFrase);
        ultimaFrase = indice;
        
        await ctx.reply(frasesPreparacao[indice]);

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-fig-"));
        const entrada = path.join(temporario, midia.tipo === "video" ? "entrada.mp4" : "entrada.bin");
        const saida = path.join(temporario, "figurinha.webp");

        try {
            const mensagemParaBaixar = {
                key: ctx.message.key,
                message: {
                    [midia.tipo === "video" ? "videoMessage" : "imageMessage"]: midia.conteudo
                }
            };
            
            const buffer = await downloadMediaMessage(mensagemParaBaixar, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
            if (!buffer || buffer.length === 0) throw new Error("Mídia vazia.");

            if (midia.tipo === "video") fs.writeFileSync(entrada, buffer);
            
            const figurinha = await converterParaFigurinha(entrada, saida, midia.tipo, buffer);

            if (!figurinha || figurinha.length === 0) throw new Error("Figurinha vazia.");

            await sendNYXMedia(ctx.sock, ctx.chat, { sticker: figurinha }, ctx.message);
            
        } catch (erro) {
            console.error("[FIG] Erro:", erro.message);
            await replyNYX(ctx, `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ ❌ ▸ ɴãᴏ ᴄᴏɴsᴇɢᴜɪ ᴄʀɪᴀʀ ᴀ ғɪɢᴜʀɪɴʜᴀ.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
        } finally {
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};
