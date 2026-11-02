const {
    setSetting,
    getSetting
} = require("../../utils/groups");


const {
    requireAdmin
} = require("../../utils/checkPermission");







module.exports = {


name:[
    "antilink",
    "antilinkgp"
],


description:
"Controle anti-link",



execute: async(ctx)=>{


requireAdmin(ctx);



if(!ctx.isGroup){

    return ctx.reply(
        "❌ Apenas grupos."
    );

}



const valor =
ctx.args[0];



if(
    valor !== "1" &&
    valor !== "0"
){

    return ctx.replyNYX(

`🔗 Uso:

7antilink 1
Ativa anti-link

7antilink 0
Desativa anti-link`,

"bot"

    );

}



const atual =
getSetting(
    ctx.chat,
    "antilink"
);



if(
    atual === (valor === "1")
){

    return ctx.replyNYX(

valor === "1"

?
"🔗 Anti-link já está ativado, senhor(a)."

:

"🔗 Anti-link já está desativado, senhor(a).",

"bot"

    );

}



setSetting(

    ctx.chat,

    "antilink",

    valor === "1"

);



await ctx.replyNYX(

valor === "1"

?

"🔗 Anti-link ativado com sucesso."

:

"🔗 Anti-link desativado com sucesso.",

"bot"

);


}


};
