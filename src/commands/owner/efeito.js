const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const execFileAsync = promisify(execFile);

const efeitosDisponiveis = {
    "8d": "apulsator=hz=0.125",
    "bass": "bass=g=15", // Graves mais fortes
    "grave": "asetrate=44100*0.8,aresample=44100,atempo=1.25", // Voz grossa/lenta
    "agudo": "asetrate=44100*1.5,aresample=44100,atempo=0.8", // Voz fina/rápida
    "eco": "aecho=0.8:0.88:60:0.4",
    "reverso": "areverse",
    "lento": "atempo=0.8",
    "rapido": "atempo=1.3",
    "radio": "highpass=f=300,lowpass=f=3000", // Efeito de rádio antigo
    "robot": "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75"
};

module.exports = {
    name: ["audioefeito"],
    description: "Aplica efeitos de áudio em uma mensagem respondida",
    execute: async (ctx) => {
        const quoted = ctx.message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted || !quoted.audioMessage) {
            const lista = Object.keys(efeitosDisponiveis).join(", ");
            return replyNYX(ctx, `🎵 *EFEITOS DE ÁUDIO*\n\nResponda a um áudio com:\n*${ctx.prefix}efeito <nome>*\n\nDisponíveis: ${lista}`, "bot");
        }

        const tipo = ctx.args[0]?.toLowerCase();
        if (!tipo || !efeitosDisponiveis[tipo]) {
            const lista = Object.keys(efeitosDisponiveis).join(", ");
            return replyNYX(ctx, `❌ Efeito inválido ou não informado.\n\nDisponíveis: ${lista}`, "bot");
        }

        try { await ctx.react("🎛️"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "audioefeito-"));
        const inputFile = path.join(temp, "input.mp3");
        const outputFile = path.join(temp, "output.mp3");

        try {
            // Prepara o objeto para download
            const quotedMsg = {
                key: {
                    remoteJid: ctx.chat,
                    id: ctx.message.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: ctx.message.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };

            const buffer = await downloadMediaMessage(
                quotedMsg, "buffer", {},
                { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
            );

            fs.writeFileSync(inputFile, buffer);

            const filtro = efeitosDisponiveis[tipo];

            // Executa o FFmpeg com o filtro escolhido
            await execFileAsync("ffmpeg", [
                "-loglevel", "error", // Esconde o banner pra não bugar o Termux
                "-y",
                "-i", inputFile,
                "-af", filtro,
                "-c:a", "libmp3lame",
                "-b:a", "128k",
                outputFile
            ], { timeout: 60000 });

            const audioBuffer = fs.readFileSync(outputFile);

            // Envia o áudio processado
            await sendNYXMedia(ctx.sock, ctx.chat, { 
                audio: audioBuffer, 
                mimetype: "audio/mpeg", 
                ptt: false, // false = áudio normal (não é gravador de voz)
                fileName: `efeito_${tipo}.mp3`
            }, ctx.message);

        } catch (error) {
            console.error("[EFEITO] Erro:", error.stderr || error.message);
            await replyNYX(ctx, "❌ Erro ao processar o áudio. Verifique se é um áudio válido.", "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};