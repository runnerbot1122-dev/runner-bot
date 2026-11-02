const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sendNYXMedia = require("../../utils/sendNYXMedia");

const execFileAsync = promisify(execFile);
const MAX_VIDEO_SECONDS = 10;

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
    
    // Verifica mídia direta
    if (atual.imageMessage) return { tipo: "image", conteudo: atual.imageMessage };
    if (atual.videoMessage) return { tipo: "video", conteudo: atual.videoMessage };
    
    // Verifica mídia citada
    const citada = desembrulharMensagem(atual.extendedTextMessage?.contextInfo?.quotedMessage);
    if (citada.imageMessage) return { tipo: "image", conteudo: citada.imageMessage };
    if (citada.videoMessage) return { tipo: "video", conteudo: citada.videoMessage };
    
    return null;
}

async function converterParaFigurinha(entrada, saida, tipo) {
    // Usa o mesmo filtro do autosticker: crop para 512x512 (sem bordas) e FPS 15
    const filtro = "scale=512:512:force_original_aspect_ratio=increase,crop=512:512";
    const argumentos = ["-y", "-i", entrada];
    
    if (tipo === "video") {
        argumentos.push("-t", String(MAX_VIDEO_SECONDS), "-vf", `${filtro},fps=15`, "-an");
    } else {
        argumentos.push("-vf", filtro);
    }

    argumentos.push(
        "-vcodec", "libwebp",
        "-lossless", "0",
        "-compression_level", "6",
        "-q:v", "50", // Qualidade boa e leve
        ...(tipo === "video" ? ["-loop", "0"] : []),
        saida
    );

    // maxBuffer aumentado para evitar erros em logs de vídeo
    await execFileAsync("ffmpeg", argumentos, { maxBuffer: 1024 * 1024 });
}

module.exports = {
    name: "fig",
    description: "Cria uma figurinha a partir de imagem ou vídeo curto",
    execute: async (ctx) => {
        const midia = localizarMidia(ctx.message);
        if (!midia) {
            return ctx.reply("🖼️ Responda a uma imagem ou vídeo de até 10 segundos com fig ou 7fig.");
        }
        
        if (midia.tipo === "video" && Number(midia.conteudo.seconds) > MAX_VIDEO_SECONDS) {
            return ctx.reply(`⏱️ O vídeo precisa ter no máximo ${MAX_VIDEO_SECONDS} segundos.`);
        }

        const frasesPreparacao = [
            "🛠️ Só um momento, já vou enviar sua figurinha.",
            "🛠️ Estou preparando sua figurinha, aguarde.",
            "🛠️ Convertendo sua mídia em figurinha. Já vai!",
            "🛠️ Sua figurinha está quase pronta..."
        ];
        const frase = frasesPreparacao[Math.floor(Math.random() * frasesPreparacao.length)];
        await ctx.reply(frase);

        const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-fig-"));
        const entrada = path.join(temporario, midia.tipo === "video" ? "entrada.mp4" : "entrada.bin");
        const saida = path.join(temporario, "figurinha.webp");

        try {
            // downloadMediaMessage é MUITO mais rápido que o mediaDownloader antigo
            const mensagemParaBaixar = {
                key: ctx.message.key,
                message: {
                    [midia.tipo === "video" ? "videoMessage" : "imageMessage"]: midia.conteudo
                }
            };
            
            const buffer = await downloadMediaMessage(
                mensagemParaBaixar, 
                "buffer", 
                {}, 
                { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
            );

            if (!buffer || buffer.length === 0) throw new Error("Mídia vazia.");

            fs.writeFileSync(entrada, buffer);
            await converterParaFigurinha(entrada, saida, midia.tipo);
            
            const figurinha = fs.readFileSync(saida);
            if (figurinha.length === 0) throw new Error("Figurinha vazia.");

            // Envia com Ver Canal
            await sendNYXMedia(ctx.sock, ctx.chat, { sticker: figurinha }, ctx.message);
            
        } catch (erro) {
            console.error("[FIG] Erro:", erro.message);
            await ctx.reply("❌ Não consegui criar a figurinha. Tente novamente com uma imagem válida ou vídeo curto.");
        } finally {
            // Limpa os arquivos temporários instantaneamente
            fs.rmSync(temporario, { recursive: true, force: true });
        }
    }
};