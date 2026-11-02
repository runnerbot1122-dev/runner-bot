const {
    proto,
    generateWAMessageFromContent
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

                    source_type:
                        "third_party"

                }

            }

        ]

    };

}


async function sendCategoriesMenu(ctx) {

    // =========================================================
    // TESTE:
    // usa o MESMO quick_reply que já funciona no menu principal
    // =========================================================

    const botoesCategorias = [
        ["👑 DONO", "menudono"],
        ["🛡️ ADMIN", "menuadm"],
        ["🤖 IA", "menuia"],
        ["📥 DOWNLOADS", "menudownload"],
        ["🎮 BRINCADEIRAS", "menubrincadeiras"]
    ].map(([display_text, id]) =>
        proto.Message
            .InteractiveMessage
            .NativeFlowMessage
            .NativeFlowButton
            .create({
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text,
                    id
                })
            })
    );


    // =========================================================
    // Mensagem interativa
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
                                "☷ MENU",

                            hasMediaAttachment:
                                false

                        }),


                body:

                    proto.Message
                        .InteractiveMessage
                        .Body
                        .create({

                            text:
                                "⚡ ʀᴜɴɴᴇʀ ᴅᴇᴠ\n\nEscolha uma categoria:"

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

                            buttons: botoesCategorias,

                            messageParamsJson:
                                "",

                            messageVersion:
                                1

                        })

            });


    // =========================================================
    // Gera mensagem
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
    // Native Flow Nodes
    // =========================================================

    const additionalNodes = [

        criarBizNode()

    ];


    if (
        !ctx.chat.endsWith("@g.us")
    ) {

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
    // Envia
    // =========================================================

    console.log(
        "CATEGORIAS TESTE: enviando quick_reply..."
    );


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
        "CATEGORIAS TESTE: quick_reply enviado"
    );

}


module.exports =
    sendCategoriesMenu;
