const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const replyNYX = require("../../utils/replyNYX");

const execFileAsync = promisify(execFile);

function obterAudioCitado(ctx) {
    const atual = ctx.message?.message?.extendedTextMessage;
    const contexto = atual?.contextInfo;
    const citado = contexto?.quotedMessage;

    if (!citado?.audioMessage) return null;

    return {
        key: {
            remoteJid: ctx.chat,
            id: contexto.stanzaId,
            participant: contexto.participant || ctx.sender
        },
        message: citado
    };
}

async function transcreverLocal(caminho, pasta) {
    const modelo = process.env.WHISPER_MODEL_PATH || path.join(process.env.HOME || os.homedir(), "whisper-models", "ggml-base.bin");
    if (!fs.existsSync(modelo)) {
        throw new Error(`Modelo Whisper não encontrado: ${modelo}`);
    }

    const prefixo = path.join(pasta, "transcricao");
    const encontrados = await execFileAsync("sh", [
        "-lc",
        "command -v whisper-cli || command -v whisper || command -v main"
    ]);
    const binario = encontrados.stdout.trim().split("\n").pop();

    if (!binario) throw new Error("Whisper.cpp não encontrado");

    await execFileAsync(binario, [
        "-m", modelo,
        "-f", caminho,
        "-l", "pt",
        "-otxt",
        "-of", prefixo,
        "-np"
    ], { timeout: 300000 });

    const txt = `${prefixo}.txt`;
    return fs.existsSync(txt) ? fs.readFileSync(txt, "utf8").trim() : "";
}

module.exports = {
    name: ["totext"],
    description: "Converte áudio em texto offline",
    execute: async (ctx) => {
        const mensagemAudio = obterAudioCitado(ctx);

        if (!mensagemAudio) {
            return replyNYX(ctx, `🎙️ *TOTEXT*\n\nResponda a um áudio com *${ctx.prefix}totext* para convertê-lo em texto.`, "bot");
        }

        const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "totext-"));
        const entrada = path.join(pasta, "audio.ogg");
    const wav = path.join(pasta, "audio.wav");

        try {
            try { await ctx.react("🎙️"); } catch (e) {}
            await replyNYX(ctx, "🎙️ Recebi o áudio. Vou transcrevê-lo, aguarde...", "bot");

            const buffer = await downloadMediaMessage(
                mensagemAudio,
                "buffer",
                {},
                { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
            );
            fs.writeFileSync(entrada, buffer);

            await execFileAsync("ffmpeg", [
                "-loglevel", "error", "-y",
                "-i", entrada,
                "-ar", "16000",
                "-ac", "1",
                "-c:a", "pcm_s16le",
                wav
            ], { timeout: 60000 });

            const texto = await transcreverLocal(wav, pasta);

            if (!texto) {
                return replyNYX(ctx, "❌ O Whisper.cpp não retornou nenhum texto. Tente enviar um áudio com voz mais clara.", "bot");
            }

            await replyNYX(ctx,
`╔═━✰『 ᴛʀᴀɴsᴄʀɪçãᴏ 』═━✰

${texto}

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
        } catch (error) {
            console.error("[TOTEXT] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui transcrever. Verifique se o FFmpeg, o Whisper.cpp e o modelo local estão instalados.", "bot");
        } finally {
            fs.rmSync(pasta, { recursive: true, force: true });
        }
    }
};