const fs = require("fs");
const path = require("path");
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const fonteNYX = require("./fonteNYX");
const sendNYX = require("./sendNYX");

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

function criarBotaoNativeFlow(name, params) {
    return proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
        name,
        buttonParamsJson: JSON.stringify(params)
    });
}

async function sendLinkGrupo(ctx, link) {
    const { sock, chat, message } = ctx;

    let nomeGrupo = "Grupo";
    try {
        const metadata = await sock.groupMetadata(chat);
        nomeGrupo = metadata.subject || "Grupo";
    } catch (e) {}

    const caminhoImagem = path.resolve(process.cwd(), "assets", "link.jpg");
    const corpo = fonteNYX("ㅤ");
    const textoRodape = fonteNYX("dev ez");
    const textoAbrir = fonteNYX("abrir link");
    const textoCopiar = fonteNYX("copiar link");

    try {
        if (!fs.existsSync(caminhoImagem)) {
            throw new Error(`Imagem não encontrada: ${caminhoImagem}`);
        }

        const media = await prepareWAMessageMedia(
            { image: fs.readFileSync(caminhoImagem) },
            { upload: sock.waUploadToServer }
        );

        const botoes = [
            criarBotaoNativeFlow("cta_url", {
                display_text: textoAbrir,
                url: link,
                merchant_url: link
            }),
            criarBotaoNativeFlow("cta_copy", {
                display_text: textoCopiar,
                id: "copiar_link_grupo",
                copy_code: link
            })
        ];

        const interactiveMessage = proto.Message.InteractiveMessage.create({
            header: proto.Message.InteractiveMessage.Header.create({
                title: " ",
                hasMediaAttachment: true,
                ...media
            }),
            body: proto.Message.InteractiveMessage.Body.create({
                text: corpo
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
                text: textoRodape
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: botoes,
                messageParamsJson: "",
                messageVersion: 1
            })
        });

        const mensagem = generateWAMessageFromContent(
            chat,
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
            {
                userJid: sock.user.id,
                quoted: message
            }
        );

        const additionalNodes = [criarBizNode()];
        if (!chat.endsWith("@g.us")) {
            additionalNodes.unshift({ tag: "bot", attrs: { biz_bot: "1" } });
        }

        sendNYX.attachNewsletterContext(mensagem.message);

        await sock.relayMessage(chat, mensagem.message, {
            messageId: mensagem.key.id,
            additionalNodes
        });
    } catch (error) {
        console.error("[LINK-NATIVE-FLOW] Falha ao enviar cartão:", error?.stack || error);

        await sock.sendMessage(chat, {
            text: `${corpo}\n\n${link}`
        }, { quoted: message });
    }
}

module.exports = sendLinkGrupo;
