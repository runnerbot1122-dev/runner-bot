const {
    requireAdmin
} = require("../../utils/checkPermission");



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


const quoted =
    ctx.message
        .message
        ?.extendedTextMessage
        ?.contextInfo
        ?.quotedMessage;



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


const metadata =
    await ctx.sock.groupMetadata(
        ctx.chat
    );



const membros =
    metadata.participants
        .map(
            membro =>
                membro.id
        );



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