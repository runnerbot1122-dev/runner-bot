const sendNYX = require("./sendNYX");
const fs = require("fs");
const path = require("path");

const {
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia
} = require("@whiskeysockets/baileys");

const ANIMACOES_POR_IMAGEM = Object.freeze({
    "admin.jpg": "menuadm.mp4",
    "dono.jpg": "menudono.mp4",
    "brincadeiras.jpg": "menubrincadeiras.mp4",
    "downloads.jpg": "menudownload.mp4",
    "ia.jpg": "menuia.mp4",
    "criador.jpg": "criador.mp4" // <-- AQUI ESTÁ A LINHA QUE FALTAVA
});


function criarBizNode() {
    return {
        tag: "biz",
        attrs: {
            actual_actors: "2",
            host_storage: "2",
            privacy_mode_ts: (Math.floor(Date.now() / 1000) - 77980457).toString()
        },
        content: [
            {
                tag: "interactive",
                attrs: { type: "native_flow", v: "1" },
                content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }]
            },
            { tag: "quality_control", attrs: { source_type: "third_party" } }
        ]
    };
}

async function sendMenu(ctx, imagem, texto) {
    const arquivo = path.join(process.cwd(), "assets", "menus", imagem);

    if (!fs.existsSync(arquivo)) {
        return ctx.reply("❌ Imagem do menu não encontrada.");
    }

    let media;
    const nomeAnimacao = ANIMACOES_POR_IMAGEM[imagem];

    if (nomeAnimacao) {
        const caminhoAnimacao = path.join(process.cwd(), "assets", "menus", "animacoes", nomeAnimacao);
        if (fs.existsSync(caminhoAnimacao)) {
            try {
                const estatisticas = fs.statSync(caminhoAnimacao);
                if (!estatisticas.isFile() || estatisticas.size === 0) throw new Error("Arquivo de animação vazio ou inválido.");
                
                const video = fs.readFileSync(caminhoAnimacao);
                const videoPreparado = await prepareWAMessageMedia(
                    { video, mimetype: "video/mp4", gifPlayback: true },
                    { upload: ctx.sock.waUploadToServer }
                );
                if (!videoPreparado?.videoMessage) throw new Error("Baileys não preparou uma mensagem de vídeo.");
                media = videoPreparado;
            } catch (erro) {
                console.warn("MENU: falha ao preparar a animação; usando imagem estática.", erro?.message || erro);
            }
        }
    }

    if (!media) {
        media = await prepareWAMessageMedia(
            { image: fs.readFileSync(arquivo) },
            { upload: ctx.sock.waUploadToServer }
        );
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: proto.Message.InteractiveMessage.Header.create({
            title: " ",
            hasMediaAttachment: true,
            ...media
        }),
        body: proto.Message.InteractiveMessage.Body.create({
            text: texto || " "
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
            text: "ʀᴜɴɴᴇʀ ᴅᴇᴠ"
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [],
            messageParamsJson: "",
            messageVersion: 1
        })
    });

    const mensagem = generateWAMessageFromContent(
        ctx.chat,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage
                }
            }
        },
        { userJid: ctx.sock.user.id }
    );

    const additionalNodes = [criarBizNode()];
    if (!ctx.chat.endsWith("@g.us")) {
        additionalNodes.unshift({ tag: "bot", attrs: { biz_bot: "1" } });
    }

    console.log("MENU: enviando cartão...");
    sendNYX.attachNewsletterContext(mensagem.message);
    
    await ctx.sock.relayMessage(ctx.chat, mensagem.message, {
        messageId: mensagem.key.id,
        additionalNodes
    });

    console.log("MENU: cartão enviado");
}

module.exports = sendMenu;