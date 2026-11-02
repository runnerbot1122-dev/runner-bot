const {
    setSetting
} = require("../../utils/groups");


const logger =
require("../../utils/logger");



module.exports = {


name:"setprefix",


description:
"Altera o prefixo do grupo",



execute: async(ctx)=>{


if(!ctx.isGroup){

    return ctx.reply(
        "❌ Esse comando só funciona em grupos."
    );

}



if(!ctx.isAdmin && !ctx.isOwner){

    return ctx.reply(
        "❌ Apenas administradores podem alterar o prefixo."
    );

}



const argumentos = Array.isArray(ctx.args) ? ctx.args : [];
const novoPrefixo = typeof argumentos[0] === "string"
    ? argumentos[0]
    : "";

if (argumentos.length !== 1 || !novoPrefixo) {
    return ctx.reply(
        `Use:

${ctx.text[0]}setprefix !

Exemplo:
!menu`
    );
}

// O prefixo deve ser curto e não pode conter espaços ou caracteres de controle.
// Isso evita prefixos invisíveis/multilinha que confundem o parser de comandos.
if (novoPrefixo.length > 3 || /[\s\p{Cc}]/u.test(novoPrefixo)) {
    return ctx.reply(
        "❌ O prefixo deve ter de 1 a 3 caracteres, sem espaços ou quebras de linha."
    );
}



setSetting(

    ctx.chat,

    "prefix",

    novoPrefixo

);



// =========================================
// LOG PRIVADO
// =========================================


await logger.action(

    ctx.sock,

    {

        acao:
        "⚙️ PREFIX ALTERADO",

        executor:
        ctx.sender,

        grupo:
        ctx.chat,

        alvo:
        ctx.sender,

        motivo:
        `Novo prefixo: ${novoPrefixo}`

    }

);



// =========================================
// AVISO NO GRUPO
// =========================================


await ctx.replyNYX(

`Prefixo alterado com sucesso, meu senhor!

Novo prefixo:
${novoPrefixo}`,

"bot"

);


}


};