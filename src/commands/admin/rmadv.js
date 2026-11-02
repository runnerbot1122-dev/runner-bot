const {
removeWarn,
getUser
}
=
require("../../utils/users");


const resolveUser =
require("../../utils/resolveUser");


const {
    requireAdmin
} = require("../../utils/checkPermission");


const {
    podePunir,
    getTarget
} = require("../../utils/checkTarget");


const logger =
require("../../utils/logger");



module.exports = {


name:[
"rmadv",
"removeradv",
"tiraradv"
],



execute: async(ctx)=>{

requireAdmin(ctx);



const alvo =
getTarget(ctx);



if(!alvo){

return ctx.reply(
"⚠️ Marque o usuário."
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



if(
    !protecao.permitido
){

    return ctx.reply(
        "❌ Não posso alterar advertências deste usuário."
    );

}



const usuario =
getUser(
    alvoReal
);



if(
    usuario.warnings <= 0
){

    return ctx.reply(

`〘 ⚠️ 𝖠𝖵𝖨𝖲𝖮 〙

ᴇsᴛᴇ ᴜsᴜáʀɪᴏ ɴãᴏ ᴘᴏssᴜɪ ᴀᴅᴠᴇʀᴛêɴᴄɪᴀs.`

    );

}



const nomeAlvo =
usuario.name ||
alvoReal.split("@")[0];



const user =
removeWarn(
    alvoReal
);



// =========================================
// LOG PRIVADO
// =========================================


await logger.action(

    ctx.sock,

    {

        acao:
        "⚠️ RMADV",

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

`╔═『✅』 𝑨𝑫𝑽 𝑹𝑬𝑴𝑶𝑽𝑰𝑫𝑨 『✅』

╠═════•

⌬ 👤 @${alvoReal.split("@")[0]}

⌬ 📋 𝑨𝒅𝒗𝒆𝒓𝒕𝒆̂𝒏𝒄𝒊𝒂𝒔: [ ${user.warnings}/3 ]

› 💠 Comporte-se no grupo.

╚═════•

> ⚡ 𝑹𝒖𝒏𝒏𝒆𝒓 𝑫𝒆𝒗`,

mentions:[
alvoReal
]

},

"user"

);


}


};