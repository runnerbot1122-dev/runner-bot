const sendNYX = require("./sendNYX");
const fs = require("fs");
const path = require("path");

const {
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia
} = require("@whiskeysockets/baileys");


// =========================================================
// MESMOS NODES DO SEU MENU QUE JÁ FUNCIONA
// =========================================================

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


async function sendMenuReferencia(
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
    // 1. ⚡ separado, igual ao seu menu atual
    // =========================================================

    await ctx.reply("⚡");


    // =========================================================
    // 2. PREPARA IMAGEM
    // =========================================================

    console.log(
        "MENU CAROUSEL: preparando imagem..."
    );


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


    console.log(
        "MENU CAROUSEL: imagem pronta ✅"
    );


    // =========================================================
    // 3. SINGLE SELECT
    //
    // Agora é praticamente igual ao payload REAL
    // que capturamos do bot de referência.
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
                            "ᴍᴇɴᴜ",

                        sections: [

                            {

                                title:
                                    "ᴍᴇɴᴜs",

                                highlight_label:
                                    "ʀᴜɴɴᴇʀ ᴅᴇᴠ",

                                rows: [

                                    {

                                        header:
                                            "ᴍᴇɴᴜ ᴅᴏɴᴏ",

                                        title:
                                            "👑 Menu Dono",

                                        id:
                                            "menudono"

                                    },

                                    {

                                        header:
                                            "ᴍᴇɴᴜ ᴀᴅᴍ",

                                        title:
                                            "🛡️ Menu Admin",

                                        id:
                                            "menuadm"

                                    },

                                    {

                                        header:
                                            "ᴍᴇɴᴜ ɪᴀ",

                                        title:
                                            "🤖 Menu IA",

                                        id:
                                            "menuia"

                                    },

                                    {

                                        header:
                                            "ᴅᴏᴡɴʟᴏᴀᴅs",

                                        title:
                                            "📥 Downloads",

                                        id:
                                            "menudownload"

                                    },

                                    {

                                        header:
                                            "ʙʀɪɴᴄᴀᴅᴇɪʀᴀs",

                                        title:
                                            "🎮 Brincadeiras",

                                        id:
                                            "menubrincadeiras"

                                    }

                                ]

                            }

                        ]

                    })

            });


    // =========================================================
    // 4. CARD INTERNO
    //
    // ESTA É A GRANDE DIFERENÇA.
    //
    // A referência coloca imagem + botão dentro de um
    // InteractiveMessage que é CARD do CarouselMessage.
    // =========================================================

    const card =
        proto.Message
            .InteractiveMessage
            .create({

                header:

                    proto.Message
                        .InteractiveMessage
                        .Header
                        .create({

                            hasMediaAttachment:
                                true,

                            ...media

                        }),


                footer:

                    proto.Message
                        .InteractiveMessage
                        .Footer
                        .create({

                            text:
                                "> *ʀᴜɴɴᴇʀ ᴅᴇᴠ*"

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
    // 5. CAROUSEL
    //
    // Mesmo que exista somente 1 card.
    //
    // A referência também tinha:
    //
    // carouselMessage.cards = [ card ]
    // =========================================================

    const carouselMessage =
        proto.Message
            .InteractiveMessage
            .CarouselMessage
            .create({

                cards: [

                    card

                ]

            });


    // =========================================================
    // 6. INTERACTIVE MESSAGE PRINCIPAL
    //
    // Repare:
    //
    // NÃO colocamos imagem aqui.
    // NÃO colocamos NativeFlow aqui.
    //
    // Aqui existe:
    //
    // body
    // +
    // carouselMessage
    //
    // IGUAL AO PAYLOAD CAPTURADO.
    // =========================================================

    const interactiveMessage =
        proto.Message
            .InteractiveMessage
            .create({

                body:

                    proto.Message
                        .InteractiveMessage
                        .Body
                        .create({

                            text:
                                "📋"

                        }),


                carouselMessage

            });


    console.log(
        "MENU CAROUSEL: estrutura criada ✅"
    );


    // =========================================================
    // 7. MENSAGEM FINAL
    //
    // IMPORTANTE:
    //
    // NÃO usamos viewOnceMessage.
    //
    // O payload REAL capturado também chegou como:
    //
    // message.interactiveMessage
    //
    // diretamente.
    // =========================================================

    const mensagem =
        generateWAMessageFromContent(

            ctx.chat,

            {

                interactiveMessage

            },

            {

                userJid:
                    ctx.sock.user.id

            }

        );


    console.log(
        "MENU CAROUSEL: messageId:",
        mensagem.key.id
    );


    // =========================================================
    // 8. NODES NATIVOS
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
    // 9. ENVIA
    // =========================================================

    console.log(
        "MENU CAROUSEL: relay..."
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
        "MENU CAROUSEL: enviado ✅"
    );

}


module.exports =
    sendMenuReferencia;