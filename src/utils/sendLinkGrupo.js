const { getBotName } = require("./botNameStore");

const {
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia
} = require("@whiskeysockets/baileys");

const sendNYX = require("./sendNYX");


const fs =
    require("fs");

const path =
    require("path");



async function sendLinkGrupo(
    ctx,
    link
){



const arquivo =
    path.join(
        process.cwd(),
        "assets",
        "link.jpg"
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




const botaoCopiar =
    proto.Message
        .InteractiveMessage
        .NativeFlowMessage
        .NativeFlowButton
        .create({

            name:
                "cta_copy",

            buttonParamsJson:

                JSON.stringify({

                    display_text:
                        "  𝘊𝘖𝘗𝘐𝘈𝘙 𝘓𝘐𝘕𝘒",

                    copy_code:
                        link

                })

        });


const botaoApagar =
    proto.Message
        .InteractiveMessage
        .NativeFlowMessage
        .NativeFlowButton
        .create({

            name:
                "quick_reply",

            buttonParamsJson:
                JSON.stringify({

                    display_text:
                    " 𝘈𝘗𝘈𝘎𝘈𝘙",

                    id:
                    "delete_link"

                })

        });



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



            body:

                proto.Message
                .InteractiveMessage
                .Body
                .create({

                    text:

` `

                }),



            footer:

                proto.Message
                .InteractiveMessage
                .Footer
                .create({

                    text:

`> ${getBotName()}`

                }),



            nativeFlowMessage:

                proto.Message
                .InteractiveMessage
                .NativeFlowMessage
                .create({

                   buttons:[

    botaoCopiar,

    botaoApagar

],

                    messageVersion:
                    1

                })

        });



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
                    "🔗"

                }),


            carouselMessage:

                proto.Message
                .InteractiveMessage
                .CarouselMessage
                .create({

                    cards:[

                        card

                    ]

                })

        });



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


sendNYX.attachNewsletterContext(mensagem.message);



await ctx.sock.relayMessage(

    ctx.chat,

    mensagem.message,

    {

        messageId:
        mensagem.key.id

    }

);



}



module.exports =
sendLinkGrupo;
