const {
    setSetting
} = require("../../utils/groups");


const {
    requireAdmin
} = require("../../utils/checkPermission");


const logger =
require("../../utils/logger");



module.exports = {


name:[
     "welcome",
     "bemvindo"
],


description:
"Ativa ou desativa boas vindas",



execute: async(ctx)=>{


requireAdmin(ctx);



if(
!ctx.isGroup
){

return ctx.reply(
"❌ Esse comando só funciona em grupos."
);

}



const valor =
ctx.args[0];



if(
valor !== "1" &&
valor !== "0"
){

return ctx.reply(
"Use:\n7welcome 1\nou\n7welcome 0"
);

}



setSetting(

    ctx.chat,

    "welcome",

    valor === "1"

);



// =========================================
// LOG PRIVADO
// =========================================


await logger.action(

    ctx.sock,

    {

        acao:
        "🌐 WELCOME ALTERADO",

        executor:
        ctx.sender,

        grupo:
        ctx.chat,

        alvo:
        ctx.sender,

        motivo:
        valor === "1"
        ?
        "Welcome ativado"
        :
        "Welcome desativado"

    }

);



// =========================================
// AVISO NO GRUPO
// =========================================


await ctx.replyNYX(

`✅ Welcome ${
valor === "1"
?
"ativado"
:
"desativado"
}`,

"bot"

);


}


};