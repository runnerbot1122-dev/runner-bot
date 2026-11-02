const { getBotName } = require("./botNameStore");

const config =
require("../config/config");


const sendNYX =
require("./sendNYX");


const {
    pegarNome
} = require("./contactCache");


const {
    getUser
} = require("./users");



function hora(){

    return new Date()
    .toLocaleTimeString();

}



module.exports = {


info(text){

    console.log(
        `[${hora()}] [INFO] ${text}`
    );

},



success(text){

    console.log(
        `[${hora()}] [ONLINE] ${text}`
    );

},



error(text){

    console.log(
        `[${hora()}] [ERRO] ${text}`
    );

},



async action(
    sock,
    dados
){


try{


if(
    !config.logsChat
){

    return;

}



// =========================================
// BUSCA DADOS DO EXECUTOR
// =========================================

const executorUser =
    dados.executor
    ?
    getUser(
        dados.executor
    )
    :
    null;



const nomeExecutor =
    executorUser?.name
    ||
    pegarNome(
        dados.executor
    )
    ||
    dados.executor?.split("@")[0]
    ||
    "Sistema";



// =========================================
// BUSCA DADOS DO ALVO
// =========================================

const alvoUser =
    dados.alvo
    ?
    getUser(
        dados.alvo
    )
    :
    null;



const nomeAlvo =
    alvoUser?.name
    ||
    pegarNome(
        dados.alvo
    )
    ||
    dados.alvo?.split("@")[0]
    ||
    "N/A";



// =========================================
// MONTA MENTIONS
// =========================================

const mentions =
[];



if(
    dados.executor
){

    mentions.push(
        dados.executor
    );

}



if(
    dados.alvo
){

    mentions.push(
        dados.alvo
    );

}



// =========================================
// ENVIA LOG
// =========================================

await sendNYX(

    sock,

    config.logsChat,

`╭────〔 🔒 NYX SECURITY LOG 〕────╮


⚡ EVENTO DETECTADO


📌 AÇÃO:
${dados.acao}


👮 EXECUTOR:
@${dados.executor.split("@")[0]}


🎯 ALVO:
@${dados.alvo.split("@")[0]}


🌐 GRUPO:
${dados.grupo || "N/A"}


🕒 HORÁRIO:
${hora()}


╰────────────────────╯

> ${getBotName()}`,

    null,

    mentions

);



}

catch(e){


console.log(
    "Erro enviando log:",
    e.message
);


}


}


};