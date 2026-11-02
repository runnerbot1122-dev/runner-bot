const fs = require("fs");
const path = require("path");

const {
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia
} = require("@whiskeysockets/baileys");

const mediaCache =
    new Map();

const mediaCacheGeneration =
    new Map();

const MEDIA_CACHE_TTL =
    30 * 60 * 1000;

function criarChaveCache(arquivo) {

    return `menu-image:${path.resolve(arquivo)}`;

}

function imagemJpegDisponivel(arquivo) {
    try {
        const informacoes = fs.statSync(arquivo);
        if (!informacoes.isFile() || informacoes.size < 4) {
            return false;
        }

        const assinatura = fs.readFileSync(arquivo).subarray(0, 2);
        return assinatura[0] === 0xff && assinatura[1] === 0xd8;
    } catch (_) {
        return false;
    }
}

function selecionarImagemPrincipal(imagem) {
    if (imagem !== "principal.jpg") {
        return imagem;
    }

    const fundo = path.join(
        process.cwd(),
        "assets",
        "menus",
        "principal-fundo.jpg"
    );

    return imagemJpegDisponivel(fundo)
        ? "principal-fundo.jpg"
        : imagem;
}


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
    imagem,
    ignorarFundo = false
) {

   const uptime = Math.floor(process.uptime() / 60);

    if (!ignorarFundo) {
        imagem = selecionarImagemPrincipal(imagem);
    }

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

    const cacheKey =
        criarChaveCache(arquivo);

    const generationAtStart =
        mediaCacheGeneration.get(cacheKey) || 0;

    const cacheItem =
        mediaCache.get(
            cacheKey
        );

    const cacheValido =
        cacheItem &&
        Date.now() - cacheItem.criadoEm <= MEDIA_CACHE_TTL;

    let media;

    if(cacheValido){

        console.log(
            "[7MENU-CACHE] HIT"
        );

        media =
            {
                imageMessage:
                    {
                        ...cacheItem.imageMessage
                    }
            };

    }
    else{

        if(cacheItem){

            mediaCache.delete(
                cacheKey
            );

            console.log(
                "[7MENU-CACHE] cache invalidado"
            );

        }

        console.log(
            "[7MENU-CACHE] MISS"
        );

        console.log(
            "[7MENU-CACHE] preparando mídia"
        );

        // =========================================================
        // 2. PREPARA IMAGEM
        // =========================================================

        console.log(
            "MENU CAROUSEL: preparando imagem..."
        );


        try {
            media =
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
        } catch (erro) {
            if (imagem === "principal-fundo.jpg") {
                console.warn(
                    "[7MENU-CACHE] fundo inválido; usando principal.jpg",
                    erro?.message || erro
                );
                return sendMenuReferencia(ctx, "principal.jpg", true);
            }

            throw erro;
        }

        if (
            generationAtStart ===
            (mediaCacheGeneration.get(cacheKey) || 0)
        ) {
            mediaCache.set(
                cacheKey,
                {
                    imageMessage:
                        media.imageMessage,
                    criadoEm:
                        Date.now()
                }
            );
        }

        console.log(
            "[7MENU-CACHE] mídia armazenada"
        );
    }

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
                            "ᴍᴇɴᴜ - ᴄᴀᴛᴇɢᴏʀɪᴀs",

                        sections: [

                            {

                                title:
                                    "ᴍᴇɴᴜs",

                                highlight_label:
require("./botNameStore").getBotName(),

                                rows: [

                                    {

                                        header:
                                            "ᴍᴇɴᴜ ᴅᴏɴᴏ",

                                        title:
                                            "𝖣𝗈𝗇𝗈",

                                        id:
                                            "menudono"

                                    },

                                    {

                                        header:
                                            "ᴍᴇɴᴜ ᴀᴅᴍ",

                                        title:
                                            "𝖠𝖽𝗆𝗂𝗇",

                                        id:
                                            "menuadm"

                                    },

                                    {

                                        header:
                                            "ᴍᴇɴᴜ ɪᴀ",

                                        title:
                                            "𝖨𝖠",

                                        id:
                                            "menuia"

                                    },

                                    {

                                        header:
                                            "ᴅᴏᴡɴʟᴏᴀᴅs",

                                        title:
                                            "𝖣𝗈𝗐𝗇𝗅𝗈𝖺𝖽𝗌",

                                        id:
                                            "menudownload"

                                    },

                                    {

                                        header:
                                            "ʙʀɪɴᴄᴀᴅᴇɪʀᴀs",

                                        title:
                                            "𝖡𝗋𝗂𝗇𝖼𝖺𝖽𝖾𝗂𝗋𝖺𝗌",

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
`╭━━━✦『 𝙼𝙴𝙽𝚄𝚂 』━━━╮✦\n┃       ─────────────\n┃\n┃ 💸 ⌁ ✧ 𝙿𝚁𝙴𝙵𝙸𝚇𝙾 » 7\n┃ 💸 ⌁ ✧ 𝚂𝚃𝙰𝚃𝚄𝚂 » 𝙾𝙽𝙻𝙸𝙽𝙴\n┃ 💸 ⌁ ✧ 𝙽𝙾𝙼𝙴 » ${require('./botNameStore').getBotName()}\n┃\n╰━━━━『 𝙳𝙴𝚅 𝙴𝚉 』━━━━╯\n       SELECIONE UMA CATEGORIA`
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

                            text: "💸"

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


    try {

        await ctx.sock.relayMessage(

            ctx.chat,

            mensagem.message,

            {

                messageId:
                    mensagem.key.id,

                additionalNodes

            }

        );

    }
    catch(error){

        if(cacheValido){

            mediaCache.delete(
                cacheKey
            );

            console.log(
                "[7MENU-CACHE] cache invalidado"
            );

        }

        throw error;

    }


    console.log(
        "MENU CAROUSEL: enviado ✅"
    );

}


sendMenuReferencia.invalidateImageCache = function (arquivo) {

    const cacheKey =
        criarChaveCache(arquivo);

    mediaCacheGeneration.set(
        cacheKey,
        (mediaCacheGeneration.get(cacheKey) || 0) + 1
    );

    return mediaCache.delete(cacheKey);

};

module.exports =
    sendMenuReferencia;
