const sendNYX = require("./sendNYX");
const fs = require("fs");
const path = require("path");

const {
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia
} = require("@whiskeysockets/baileys");


function criarBizNode() {

    return {

        tag: "biz",

        attrs: {

            actual_actors: "2",

            host_storage: "2",

            privacy_mode_ts: (
                Math.floor(Date.now() / 1000) -
                77980457
            ).toString()

        },

        content: [

            {

                tag: "interactive",

                attrs: {

                    type: "native_flow",

                    v: "1"

                },

                content: [

                    {

                        tag: "native_flow",

                        attrs: {

                            v: "9",

                            name: "mixed"

                        }

                    }

                ]

            },

            {

                tag: "quality_control",

                attrs: {

                    source_type: "third_party"

                }

            }

        ]

    };

}


async function sendMenuTeste(
    ctx,
    imagem
) {

    const arquivo =
        path.join(
            process.cwd(),
            "assets",
            "menus",
            imagem
        );


    if (!fs.existsSync(arquivo)) {

        return ctx.reply(
            "❌ Imagem do menu não encontrada."
        );

    }


    // =========================================================
    // 1. Emoji separado
    // =========================================================

    await ctx.reply("⚡");


    // =========================================================
    // 2. Prepara imagem
    // =========================================================

    const media =
        await prepareWAMessageMedia(

            {
                image:
                    fs.readFileSync(
                        arquivo
                    )
            },

            {
                upload:
                    ctx.sock.waUploadToServer
            }

        );


    // =========================================================
    // 3. Botão SINGLE SELECT
    // =========================================================

    const botaoMenu =
        proto.Message
            .InteractiveMessage
            .NativeFlowMessage
            .NativeFlowButton
            .create({

                name:
                    "single_select",

                buttonParamsJson:
                    JSON.stringify({

                        title:
                            "☷ MENU",

                        sections: [

                            {

                                title:
                                    "MENUS",

                                rows: [

                                    {

                                        title:
                                            "👑 Menu Dono",

                                        description:
                                            "Comandos exclusivos do dono",

                                        id:
                                            "menudono"

                                    },

                                    {

                                        title:
                                            "🛡️ Menu Admin",

                                        description:
                                            "Comandos de administração",

                                        id:
                                            "menuadm"

                                    },

                                    {

                                        title:
                                            "🤖 Menu IA",

                                        description:
                                            "Recursos de inteligência artificial",

                                        id:
                                            "menuia"

                                    },

                                    {

                                        title:
                                            "📥 Downloads",

                                        description:
                                            "Ferramentas de download",

                                        id:
                                            "menudownload"

                                    },

                                    {

                                        title:
                                            "🎮 Brincadeiras",

                                        description:
                                            "Comandos de diversão",

                                        id:
                                            "menubrincadeiras"

                                    }

                                ]

                            }

                        ]

                    })

            });


    // =========================================================
    // 4. Cartão interativo
    // =========================================================

    const interactiveMessage =
        proto.Message
            .InteractiveMessage
            .create({

                header:

                    proto.Message
                        .InteractiveMessage
                        .Header
                        .create({

                            title:
                                " ",

                            hasMediaAttachment:
                                true,

                            ...media

                        }),


                body:

                    proto.Message
                        .InteractiveMessage
                        .Body
                        .create({

                            text:
                                " "

                        }),


                footer:

                    proto.Message
                        .InteractiveMessage
                        .Footer
                        .create({

                            text:
                                "ʀᴜɴɴᴇʀ ᴅᴇᴠ"

                        }),


                nativeFlowMessage:

                    proto.Message
                        .InteractiveMessage
                        .NativeFlowMessage
                        .create({

                            buttons: [

                                botaoMenu

                            ],

                            messageParamsJson:
                                "",

                            messageVersion:
                                1

                        })

            });


    // =========================================================
    // 5. Gera mensagem
    // =========================================================

    const mensagem =
        generateWAMessageFromContent(

            ctx.chat,

            {

                viewOnceMessage: {

                    message: {

                        messageContextInfo: {

                            deviceListMetadata: {},

                            deviceListMetadataVersion:
                                2

                        },

                        interactiveMessage

                    }

                }

            },

            {

                userJid:
                    ctx.sock.user.id

            }

        );


    // =========================================================
    // 6. Native Flow nodes
    // =========================================================

    const additionalNodes = [

        criarBizNode()

    ];


    if (!ctx.chat.endsWith("@g.us")) {

        additionalNodes.unshift({

            tag:
                "bot",

            attrs: {

                biz_bot:
                    "1"

            }

        });

    }


    // =========================================================
    // 7. Envia cartão de teste
    // =========================================================

    console.log(
        "MENU TESTE: enviando cartão single_select..."
    );


    sendNYX.attachNewsletterContext(mensagem.message);

    await ctx.sock.relayMessage(

        ctx.chat,

        mensagem.message,

        {

            messageId:
                mensagem.key.id,

            additionalNodes

        }

    );


    console.log(
        "MENU TESTE: cartão enviado"
    );

}


module.exports =
    sendMenuTeste;