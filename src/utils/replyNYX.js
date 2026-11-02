const sendNYX =
require("./sendNYX");

const sendNYXMedia =
require("./sendNYXMedia");

const fonteNYX =
    require("./fonteNYX");

const { getBotName } = require("./botNameStore");



async function replyNYX(
    ctx,
    texto,
    modo="user"
){


    function personalizarNome(valor) {
        if (typeof valor !== "string") return valor;

        return valor.replace(
            /(?:𝖭𝖸𝖷|𝘕𝘠𝘟|ɴʏx)(?:\s*†)?\s*(?:𝖡𝖮𝖳|𝘉𝘖𝘛|ʙᴏᴛ|BOT)|NYX(?:\s*†)?\s*BOT/giu,
            () => getBotName()
        );
    }

    if(typeof texto === "string"){

        texto = personalizarNome(fonteNYX(texto));

    }

    if(
        texto &&
        typeof texto === "object" &&
        typeof texto.text === "string"
    ){

        texto = {
            ...texto,
            text:
                personalizarNome(fonteNYX(texto.text)),
            ...(typeof texto.caption === "string"
                ? { caption: personalizarNome(fonteNYX(texto.caption)) }
                : {})
        };

    }



let quote;



if(
modo === "bot"
){

quote = {

message:{
    conversation:
    "·.🚶🏽‍♂️:. ᴇᴢ ᴅΣᴠ"
},


sender:
ctx.sock.user.id
.split(":")[0]
+
"@s.whatsapp.net",


id:
"NYX_REPLY"

};


}



if(
modo === "user"
){

quote = {

message:
ctx.message.message,


sender:
ctx.sender,


id:
ctx.message.key.id

};


}



if(
typeof texto === "string"
){

return sendNYX(
    ctx.sock,
    ctx.chat,
    texto,
    quote
);

}


// TEXTO COM MENÇÕES
if(
texto
&&
typeof texto === "object"
&&
typeof texto.text === "string"
){

return sendNYX(
    ctx.sock,
    ctx.chat,
    texto.text,
    quote,
    Array.isArray(texto.mentions)
        ?
        texto.mentions
        :
        []
);

}


// MÍDIA
return sendNYXMedia(
    ctx.sock,
    ctx.chat,
    texto,
    quote
);


}



module.exports =
replyNYX;