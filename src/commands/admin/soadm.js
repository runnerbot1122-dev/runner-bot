const {
    requireAdmin
} = require("../../utils/checkPermission");


const soadm =
require("../../utils/soadm");



module.exports = {


name:[
    "soadm",
    "so_adm"
],


description:
"Ativa ou desativa comandos públicos",



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

`⚙️ Uso:

7soadm 1
Ativa comandos públicos

7soadm 0
Desativa comandos públicos`,

"bot"

    );

}



if(
valor === "1"
){

    if(
        soadm.status(
            ctx.chat
        )
    ){

        return ctx.replyNYX(

`🔓 𝖲𝖮𝖠𝖣𝖬 𝖩Á 𝖤𝖲𝖳Á 𝖠𝖳𝖨𝖵𝖮.`,

"bot"

        );

    }


    soadm.ativar(
        ctx.chat
    );


    return ctx.replyNYX(

`🔒 𝖲𝖮𝖠𝖣𝖬 𝖠𝖳𝖨𝖵𝖠𝖣𝖮.

Comandos públicos bloqueados.`,

"bot"

    );

}

if(
    !soadm.status(
        ctx.chat
    )
){

    return ctx.replyNYX(

`🔒 𝖲𝖮𝖠𝖣𝖬 𝖩Á 𝖤𝖲𝖳Á 𝖣𝖤𝖲𝖠𝖳𝖨𝖵𝖠𝖣𝖮.`,

"bot"

    );

}


soadm.desativar(
    ctx.chat
);



await ctx.replyNYX(

`🔓 𝖲𝖮𝖠𝖣𝖬 𝖣𝖤𝖲𝖠𝖳𝖨𝖵𝖠𝖣𝖮.

Membros poderão utilizar comandos públicos.`,

"bot"

);


}


};