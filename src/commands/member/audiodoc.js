const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

const LIMITE_AUDIO = 50 * 1024 * 1024;

function desembrulharMensagem(mensagem) {
    let atual = mensagem || {};
    const wrappers = [
        "ephemeralMessage",
        "viewOnceMessage",
        "viewOnceMessageV2",
        "viewOnceMessageV2Extension",
        "documentWithCaptionMessage"
    ];

    for (let i = 0; i < 3; i += 1) {
        const wrapper = wrappers.find((nome) => atual?.[nome]?.message);
        if (!wrapper) break;
        atual = atual[wrapper].message;
    }

    return atual;
}

function obterAudioCitado(ctx) {
    const contexto = ctx.message?.message?.extendedTextMessage?.contextInfo;
    const citado = desembrulharMensagem(contexto?.quotedMessage);
    const audio = citado?.audioMessage;

    if (!audio) return null;

    return {
        key: {
            remoteJid: ctx.chat,
            id: contexto?.stanzaId,
            participant: contexto?.participant || ctx.sender
        },
        message: citado,
        audio
    };
}

function extensaoDoAudio(mimetype = "") {
    const tipo = String(mimetype).toLowerCase().split(";")[0].trim();
    const extensoes = {
        "audio/ogg": ".ogg",
        "audio/mpeg": ".mp3",
        "audio/mp4": ".m4a",
        "audio/wav": ".wav",
        "audio/x-wav": ".wav",
        "audio/webm": ".webm"
    };
    return extensoes[tipo] || ".ogg";
}

function nomeDoDocumento(audio) {
    const original = String(audio?.fileName || "")
        .replace(/[\r\n\\/]/g, "")
        .trim();

    if (original && original.length <= 120) return original;
    return `audio${extensaoDoAudio(audio?.mimetype)}`;
}

module.exports = {
    name: ["audiodoc", "audio_documento", "audio2doc"],
    description: "Envia um áudio citado como documento",
    execute: async (ctx) => {
        const audioCitado = obterAudioCitado(ctx);

        if (!audioCitado) {
            return replyNYX(
                ctx,
                `📄 *ÁUDIO PARA DOCUMENTO*\n\nResponda a um áudio com *${ctx.prefix}audiodoc* para recebê-lo como documento.`,
                "bot"
            );
        }

        const tamanhoInformado = Number(audioCitado.audio.fileLength || 0);
        if (Number.isFinite(tamanhoInformado) && tamanhoInformado > LIMITE_AUDIO) {
            return replyNYX(ctx, "❌ Esse áudio ultrapassa o limite de 50 MB.", "bot");
        }

        try { await ctx.react("📄"); } catch (e) {}

        try {
            const buffer = await downloadMediaMessage(
                audioCitado,
                "buffer",
                {},
                {
                    logger: console,
                    reuploadRequest: ctx.sock.updateMediaMessage
                }
            );

            if (!buffer || !buffer.length) {
                throw new Error("Áudio baixado vazio");
            }

            if (buffer.length > LIMITE_AUDIO) {
                return replyNYX(ctx, "❌ Esse áudio ultrapassa o limite de 50 MB.", "bot");
            }

            return await sendNYXMedia(
                ctx.sock,
                ctx.chat,
                {
                    document: buffer,
                    mimetype: audioCitado.audio.mimetype || "audio/ogg",
                    fileName: nomeDoDocumento(audioCitado.audio),
                    caption: "📄 Áudio enviado como documento."
                },
                ctx.message
            );
        } catch (error) {
            console.error("[AUDIODOC] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui converter esse áudio em documento. Tente novamente.", "bot");
        }
    }
};
