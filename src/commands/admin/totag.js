const {
    requireAdmin
} = require("../../utils/checkPermission");



const { getSoundStickerKit } = require("../../utils/soundStickerKit");

function unwrapMessage(message) {
    let atual = message || {};
    for (let i = 0; i < 6; i++) {
        const interno = atual.ephemeralMessage?.message || atual.viewOnceMessage?.message ||
            atual.viewOnceMessageV2?.message || atual.viewOnceMessageV2Extension?.message ||
            atual.documentWithCaptionMessage?.message || atual.editedMessage?.message;
        if (!interno) break;
        atual = interno;
    }
    return atual;
}

function quotedOf(message) {
    const atual = unwrapMessage(message?.message);
    for (const valor of Object.values(atual)) {
        const citado = valor?.contextInfo?.quotedMessage;
        if (citado) return unwrapMessage(citado);
    }
    return null;
}

function stickerOf(message) {
    const atual = unwrapMessage(message);
    return atual.stickerMessage || atual.audioStickerMessage?.message?.stickerMessage || null;
}

module.exports = {


name:[
    "totag",
    "t",
    "hidetag"
],


description:
"Envia mensagem marcando todos",



execute: async(ctx)=>{


requireAdmin(ctx);



if(!ctx.isGroup){

    return ctx.reply(
        "❌ Apenas grupos."
    );

}



let texto = "";


const metadata = await ctx.sock.groupMetadata(ctx.chat);
const membros = metadata.participants.map(membro => membro.id);
const quoted = quotedOf(ctx.message);
const sticker = stickerOf(quoted);

if (sticker) {
    try {
        const kit = await getSoundStickerKit();
        const webp = await kit.downloadMedia(sticker, "sticker");
        const clip = await kit.getStickerSound(sticker);
        if (clip) {
            await kit.sendSoundSticker(ctx.sock, ctx.chat, { webp, clip, quoted: ctx.message, mentions: membros });
        } else {
            await ctx.sock.sendMessage(ctx.chat, { sticker: webp, mentions: membros }, { quoted: ctx.message });
        }
    } catch (erro) {
        console.error("[TOTAG-STICKER] Erro:", erro.message);
        return ctx.reply("❌ Não consegui reenviar essa figurinha.");
    }
    return;
}

if(quoted){

    texto =

        quoted.conversation ||

        quoted.extendedTextMessage?.text ||

        quoted.imageMessage?.caption ||

        quoted.videoMessage?.caption ||

        "";

}
else {

    texto =
        ctx.args.join(" ");

}


if(!texto){

    return ctx.reply(
        "⚠️ Responda uma mensagem ou escreva o texto para marcar todos."
    );

}


await ctx.replyNYX(

    {

        text:
        texto,

        mentions:
        membros

    },

    "bot"

);



}


};
