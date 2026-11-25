const { getBotEmoji } = require("./botEmoji");
const fs = require("fs");
const path = require("path");

const {
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia
} = require("@whiskeysockets/baileys");

const mediaCache = new Map();
const mediaCacheGeneration = new Map();
const MEDIA_CACHE_TTL = 30 * 60 * 1000;

function criarChaveCache(arquivo) {
    return `menu-image:${path.resolve(arquivo)}`;
}

function imagemJpegDisponivel(arquivo) {
    try {
        const informacoes = fs.statSync(arquivo);
        if (!informacoes.isFile() || informacoes.size < 4) return false;
        const assinatura = fs.readFileSync(arquivo).subarray(0, 2);
        return assinatura[0] === 0xff && assinatura[1] === 0xd8;
    } catch (_) {
        return false;
    }
}

function selecionarImagemPrincipal(imagem) {
    if (imagem !== "principal.jpg") return imagem;
    const fundo = path.join(process.cwd(), "assets", "menus", "principal-fundo.jpg");
    return imagemJpegDisponivel(fundo) ? "principal-fundo.jpg" : imagem;
}

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

async function sendMenuReferencia(ctx, imagem, ignorarFundo = false) {
    if (!ignorarFundo) imagem = selecionarImagemPrincipal(imagem);

    const arquivo = path.join(process.cwd(), "assets", "menus", imagem);
    if (!fs.existsSync(arquivo)) return ctx.reply("❌ Imagem do menu não encontrada.");

    const cacheKey = criarChaveCache(arquivo);
    const generationAtStart = mediaCacheGeneration.get(cacheKey) || 0;
    const cacheItem = mediaCache.get(cacheKey);
    const cacheValido = cacheItem && Date.now() - cacheItem.criadoEm <= MEDIA_CACHE_TTL;

    let media;

    if(cacheValido){
        media = { imageMessage: { ...cacheItem.imageMessage } };
    } else {
        if(cacheItem) mediaCache.delete(cacheKey);
        try {
            media = await prepareWAMessageMedia(
                { image: fs.readFileSync(arquivo) },
                { upload: ctx.sock.waUploadToServer }
            );
        } catch (erro) {
            if (imagem === "principal-fundo.jpg") return sendMenuReferencia(ctx, "principal.jpg", true);
            throw erro;
        }
        if (generationAtStart === (mediaCacheGeneration.get(cacheKey) || 0)) {
            mediaCache.set(cacheKey, { imageMessage: media.imageMessage, criadoEm: Date.now() });
        }
    }

    // =========================================================
    // MENU SIMPLIFICADO E COM FONTES LIMPAS (IGUAL À REFERÊNCIA)
    // =========================================================
    const botaoMenu = proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
        name: "single_select",
        buttonParamsJson: JSON.stringify({
            title: "Menu - Categorias",
            sections: [
                {
                    title: "Meus Menus",
                    highlight_label: "Dev Ez",
                    rows: [
                        { title: "ᴍᴇɴᴜ ᴘʀɪɴᴄɪᴘᴀʟ", description: "ᴀʙʀɪʀ ᴛᴏᴅᴏs ᴏs ᴍᴇɴᴜs", id: "menuprincipal" },
                        { title: "ᴍᴇɴᴜ ᴀᴅᴍ", description: "ᴄᴏᴍᴀɴᴅᴏꜱ ᴅᴇ ᴀᴅᴍ", id: "menuadm" },
                        { title: "ᴍᴇɴᴜ ᴅᴏɴᴏ", description: "ᴄᴏᴍᴀɴᴅᴏs ᴇxᴄʟᴜsɪᴠᴏs", id: "menudono" },
                        { title: "ʙʀɪɴᴄᴀᴅᴇɪʀᴀꜱ", description: "ᴊᴏɢᴏꜱ ᴇ ɪɴᴛᴇʀᴀᴄ̧ᴏ̃ᴇꜱ", id: "menubrincadeiras" }
                    ]
                },
                {
                    title: "Status de Comandos",
                    rows: [
                        { title: "ꜱᴛᴀᴛᴜꜱ ᴅᴏ ɢʀᴜᴘᴏ", description: "ᴠᴇʀ ꜱᴛᴀᴛᴜꜱ ᴀᴛᴜᴀʟ", id: "status" }
                    ]
                },
                {
                    title: "Criador & Dono",
                    rows: [
                        { title: "ᴄʀɪᴀᴅᴏʀ", description: "ꜰᴀʟᴀʀ ᴄᴏᴍ ᴏ ᴇᴢ", id: "criador" }
                    ]
                }
            ]
        })
    });

    const card = proto.Message.InteractiveMessage.create({
        header: proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: true,
            ...media
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
            text: `╭━━━✦『 𝙼𝙴𝙽𝚄𝚂 』━━━╮✦\n┃       ─────────────\n┃\n┃ ${getBotEmoji()} ⌁ ✧ 𝙿𝚁𝙴𝙵𝙸𝚇𝙾 » 7\n┃ ${getBotEmoji()} ⌁ ✧ 𝚂𝚃𝙰𝚃𝚄𝚂 » 𝙾𝙽𝙻𝙸𝙽𝙴\n┃ ${getBotEmoji()} ⌁ ✧ 𝙽𝙾𝙼𝙴 » ${require('./botNameStore').getBotName()}\n┃\n╰━━━━『 𝙳𝙴𝚅 𝙴𝚉  』━━━━╯\n       SELECIONE UMA CATEGORIA`
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [botaoMenu],
            messageParamsJson: "",
            messageVersion: 1
        })
    });

    const carouselMessage = proto.Message.InteractiveMessage.CarouselMessage.create({
        cards: [card]
    });

    const interactiveMessage = proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({ text: getBotEmoji() }),
        carouselMessage
    });

    const mensagem = generateWAMessageFromContent(
        ctx.chat,
        { interactiveMessage },
        { userJid: ctx.sock.user.id }
    );

    const additionalNodes = [criarBizNode()];
    if (!ctx.chat.endsWith("@g.us")) {
        additionalNodes.unshift({ tag: "bot", attrs: { biz_bot: "1" } });
    }

    try {
        await ctx.sock.relayMessage(
            ctx.chat,
            mensagem.message,
            { messageId: mensagem.key.id, additionalNodes }
        );
    } catch(error) {
        if(cacheValido) mediaCache.delete(cacheKey);
        throw error;
    }
}

sendMenuReferencia.invalidateImageCache = function (arquivo) {
    const cacheKey = criarChaveCache(arquivo);
    mediaCacheGeneration.set(cacheKey, (mediaCacheGeneration.get(cacheKey) || 0) + 1);
    return mediaCache.delete(cacheKey);
};

module.exports = sendMenuReferencia;