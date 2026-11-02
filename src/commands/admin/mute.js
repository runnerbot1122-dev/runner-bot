const { getBotName } = require("../../utils/botNameStore");

const {
    requireAdmin
} = require("../../utils/checkPermission");


const {
    podePunir,
    getTarget
} = require("../../utils/checkTarget");


const {
    mutar
} = require("../../utils/mutes");


const resolveUser =
    require("../../utils/resolveUser");


const logger =
    require("../../utils/logger");



module.exports = {


name:[
    "mute"
],


description:
"Muta um usuário",



execute: async(ctx)=>{


requireAdmin(ctx);



if(!ctx.isGroup){

    return ctx.reply(
        "❌ Apenas grupos."
    );

}



const alvo =
    getTarget(ctx);



if(!alvo){

    return ctx.reply(
        "⚠️ Marque o usuário que deseja mutar."
    );

}



const alvoReal =
    await resolveUser(
        ctx.sock,
        ctx.chat,
        alvo
    );



const protecao =
    podePunir(
        ctx,
        alvoReal
    );



if (!protecao.permitido) {
    if (protecao.motivo === "bot") {
        return ctx.reply(`❌ Não posso me mutar.

> ${getBotName()}`);
    }

    if (protecao.motivo === "dono") {
        return ctx.reply(`👑 Não posso mutar meu criador.

> ${getBotName()}`);
    }

    // Fail closed: LIDs sem identidade verificada e qualquer outro alvo
    // protegido não podem seguir para alteração do estado de mute.
    return ctx.reply("⚠️ Não foi possível verificar a identidade desse usuário. Nenhuma alteração foi feita.");
}


mutar(

    ctx.chat,

    alvoReal,

    alvo

);



// =========================================
// LOG PRIVADO
// =========================================


await logger.action(

    ctx.sock,

    {

        acao:
        "🔇 MUTE",

        executor:
        ctx.sender,

        alvo:
        alvoReal,

        grupo:
        ctx.chat

    }

);



// =========================================
// AVISO NO GRUPO
// =========================================


await ctx.replyNYX(

{

text:

`〘 @${alvoReal.split("@")[0]} 〙

🔇 ᴜsᴜáʀɪᴏ ᴍᴜᴛᴀᴅᴏ...

ᴇɴǫᴜᴀɴᴛᴏ ᴏs ᴍᴀɪᴏʀᴇs ғᴀʟᴀᴍ, ᴠᴏᴄᴇ̂ ᴇsᴄᴜᴛᴀ 🤫`,

mentions:[

    alvoReal

]

},

"user"

);



}


};