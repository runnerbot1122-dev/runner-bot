const { getBotName } = require("../../utils/botNameStore");

const {
    getSetting,
    setSetting
} = require("../../utils/groups");


module.exports = {


name:[
    "unbangp"
],


description:
"Ativa o bot neste grupo",



execute: async(ctx)=>{


if(!ctx.isGroup){

    return ctx.reply(
        "❌ Esse comando só funciona em grupos."
    );

}



if(!ctx.isOwner){

    return ctx.reply(
        "❌ Apenas o dono pode usar esse comando."
    );

}



const ativo =
    getSetting(
        ctx.chat,
        "botOff"
    );



if(!ativo){

    return ctx.replyNYX(
        getBotName() + " 𝗃𝖺́ 𝖾𝗌𝗍𝖺́ 𝖺𝗍𝗂𝗏𝖺𝖽𝗈 𝗇𝖾𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈, 𝗌𝖾𝗇𝗁𝗈𝗋(𝖺). 🙇🏽‍♂️",

"user"

    );

}



setSetting(
    ctx.chat,
    "botOff",
    false
);



await ctx.replyNYX(
    getBotName() + " 𝖺𝗍𝗂𝗏𝖺𝖽𝗈 𝗇𝖾𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈, 𝗌𝖾𝗇𝗁𝗈𝗋(𝖺). 🙇🏽‍♂️",

"user"

);


}


};