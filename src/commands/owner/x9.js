const { getBotName } = require("../../utils/botNameStore");

const x9 =
require("../../utils/x9");



module.exports = {


name:[
    "modox9",
    "x9"
],


description:
"Ativa ou desativa o monitoramento do grupo",



execute: async(ctx)=>{


if(!ctx.isOwner){

    return ctx.reply(
        "❌ Apenas o dono pode usar este comando."
    );

}



if(!ctx.isGroup){

    return ctx.reply(
        "❌ O X9 deve ser configurado dentro de um grupo."
    );

}



if(
    x9.status(
        ctx.chat
    )
){

    x9.desativar(
        ctx.chat
    );


    return ctx.replyNYX(

`🔓 ${getBotName()} 𝖷9 𝖣𝖤𝖲𝖠𝖳𝖨𝖵𝖠𝖣𝖮.\n\nEste grupo não será mais monitorado.`,

"bot"

    );

}



x9.ativar(
    ctx.chat
);



await ctx.replyNYX(

`🔒 ${getBotName()} 𝖷9 𝖠𝖳𝖨𝖵𝖠𝖣𝖮.\n\nEste grupo agora está sendo monitorado.`,

"bot"

);


}


};
