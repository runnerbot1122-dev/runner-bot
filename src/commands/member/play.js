const axios = require("axios");
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const fonteNYX = require("../../utils/fonteNYX");
const sendNYX = require("../../utils/sendNYX");

const NEXRAY_PLAY_URL = "https://api.nexray.eu.cc/downloader/ytplay";
const MAX_API_BYTES = 8 * 1024 * 1024;

function criarBizNode() {
    return {
        tag: "biz",
        attrs: {
            actual_actors: "2",
            host_storage: "2",
            privacy_mode_ts: (Math.floor(Date.now() / 1000) - 77980457).toString()
        },
        content: [
            { tag: "interactive", attrs: { type: "native_flow", v: "1" }, content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }] },
            { tag: "quality_control", attrs: { source_type: "third_party" } }
        ]
    };
}

function criarBotaoNativeFlow(name, params) {
    return proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
        name,
        buttonParamsJson: JSON.stringify(params)
    });
}

function formatarViews(value) {
    if (value === undefined || value === null || value === "") return "N/A";
    return String(value);
}

async function baixarThumbnail(url) {
    if (!url) return null;
    const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000,
        maxContentLength: MAX_API_BYTES,
        maxBodyLength: MAX_API_BYTES
    });
    return Buffer.from(response.data);
}

async function enviarPlayInterativo(ctx, data) {
    const result = data.result;
    const videoUrl = encodeURIComponent(result.url);
    const titulo = result.title || "Título desconhecido";
    const canal = result.channel || "Canal desconhecido";
    const corpo = fonteNYX(
        `🎵 *PLAY YOUTUBE*\n\n` +
        `📄 *Título:* ${titulo}\n` +
        `👤 *Canal:* ${canal}\n` +
        `⏱️ *Duração:* ${result.duration || "N/A"}\n` +
        `📅 *Postagem:* ${result.upload_at || "N/A"}\n` +
        `🌐 *ID do vídeo:* ${result.id || "N/A"}\n` +
        `📁 *Formato:* MP3\n` +
        `👁️ *Visualizações:* ${formatarViews(result.views)}\n` +
        `🤖 *Bot:* Runner Bot\n` +
        `🔗 *Link:* ${result.url}\n\n` +
        `© Runner Bot`
    );

    const botoes = [
        criarBotaoNativeFlow("quick_reply", {
            display_text: "「🩸」ᴅᴏᴄᴜᴍᴇɴᴛᴏ",
            id: `play_document|${videoUrl}`
        }),
        criarBotaoNativeFlow("quick_reply", {
            display_text: "「🩸」ᴀᴜᴅɪᴏ",
            id: `play_audio|${videoUrl}`
        }),
        criarBotaoNativeFlow("quick_reply", {
            display_text: "「🩸」ᴠíᴅᴇᴏ",
            id: `play_video|${videoUrl}`
        })
    ];

    let thumbnail = null;
    try {
        thumbnail = await baixarThumbnail(result.thumbnail);
    } catch (error) {
        console.error("[PLAY] Falha ao preparar thumbnail:", error.message);
    }

    let media = null;
    if (thumbnail) {
        media = await prepareWAMessageMedia(
            { image: thumbnail },
            { upload: ctx.sock.waUploadToServer }
        );
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
        ...(media ? {
            header: proto.Message.InteractiveMessage.Header.create({
                title: " ",
                hasMediaAttachment: true,
                ...media
            })
        } : {}),
        body: proto.Message.InteractiveMessage.Body.create({
            text: `${corpo}\n\nEscolha uma opção:`
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
            text: fonteNYX("ᴇᴢ ᴅᴇᴠ")
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: botoes,
            messageParamsJson: "",
            messageVersion: 1
        })
    });

    const mensagem = generateWAMessageFromContent(ctx.chat, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage
            }
        }
    }, {
        userJid: ctx.sock.user.id,
        quoted: ctx.message
    });

    const additionalNodes = [criarBizNode()];
    if (!ctx.chat.endsWith("@g.us")) {
        additionalNodes.unshift({ tag: "bot", attrs: { biz_bot: "1" } });
    }

    sendNYX.attachNewsletterContext(mensagem.message);
    await ctx.sock.relayMessage(ctx.chat, mensagem.message, {
        messageId: mensagem.key.id,
        additionalNodes
    });
}

module.exports = {
    name: ["play", "ytplay", "playmusic"],
    description: "Pesquisa músicas no YouTube usando a NexRay",
    execute: async ctx => {
        const pesquisa = (Array.isArray(ctx.args) ? ctx.args : []).join(" ").trim();
        if (!pesquisa) {
            return ctx.replyNYX(`${fonteNYX("PESQUISAR MÚSICA")}\n\nUso: ${ctx.prefix}play nome da música`, "bot");
        }

        try { await ctx.react("⏳"); } catch (error) {}
        await ctx.replyNYX("🔍 Pesquisando no YouTube pela NexRay, aguarde...", "bot");

        try {
            const response = await axios.get(NEXRAY_PLAY_URL, {
                params: { q: pesquisa },
                timeout: 60000,
                maxContentLength: MAX_API_BYTES,
                maxBodyLength: MAX_API_BYTES,
                headers: { Accept: "application/json", "User-Agent": "NexRay-API-Client/1.0.0" }
            });

            if (!response.data?.status || !response.data?.result?.url) {
                throw new Error(response.data?.error || "A NexRay não encontrou a música.");
            }

            await enviarPlayInterativo(ctx, response.data);
            try { await ctx.react("✅"); } catch (error) {}
        } catch (error) {
            console.error("[PLAY NEXRAY] Erro:", error.message);
            try { await ctx.react("❌"); } catch (erroReact) {}
            return ctx.replyNYX("❌ Não consegui pesquisar essa música pela NexRay. Tente novamente mais tarde.", "bot");
        }
    }
};