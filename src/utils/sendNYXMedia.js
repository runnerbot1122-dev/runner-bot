const {
    generateWAMessage
}
=
require("@whiskeysockets/baileys");

const sendNYX = require("./sendNYX");

const ERRO_TRANSMISSAO = Symbol("sendNYXMedia.transmissionError");


// Cache em memória das mídias já enviadas.
// Reiniciar o bot limpa automaticamente o cache.
const mediaCache =
new Map();


// Vamos renovar a referência periodicamente.
// 30 minutos é propositalmente conservador.
const CACHE_TTL =
30 * 60 * 1000;



function criarContextInfo(
    contextoNewsletter,
    quotedMsg
){

return {
    ...(contextoNewsletter || {}),
    ...(quotedMsg
        ? {
            quotedMessage: quotedMsg.message,
            participant: quotedMsg.sender,
            stanzaId: quotedMsg.id || "NYX_REPLY"
        }
        : {})
};

}



function mesclarContextInfo(
    contextoExistente,
    contextoAdicional
){

const mesclado = {
    ...(contextoExistente && typeof contextoExistente === "object"
        ? contextoExistente
        : {}),
    ...(contextoAdicional || {})
};

return Object.keys(mesclado).length > 0
    ? mesclado
    : null;

}



function marcarErroTransmissao(erro){

let erroMarcado = erro instanceof Error
    ? erro
    : new Error("Falha ao transmitir mídia", { cause: erro });

try {
    Object.defineProperty(erroMarcado, ERRO_TRANSMISSAO, {
        value: true
    });
} catch (erroAoMarcar) {
    erroMarcado = new Error(erroMarcado.message, { cause: erroMarcado });
    Object.defineProperty(erroMarcado, ERRO_TRANSMISSAO, {
        value: true
    });
}

return erroMarcado;

}



function obterChaveCache(
    conteudo
){

// Por enquanto fazemos cache somente
// de imagens locais fixas.

const caminho =
conteudo
?.image
?.url;


if(
typeof caminho !== "string"
){

return null;

}


// URL externa não entra nesse cache.
if(
caminho.startsWith("http://")
||
caminho.startsWith("https://")
){

return null;

}


return `image:${caminho}`;

}



function obterCache(
    chave
){

if(!chave){

return null;

}


const item =
mediaCache.get(
    chave
);


if(!item){

return null;

}


const expirou =
Date.now() - item.criadoEm
>
CACHE_TTL;


if(expirou){

mediaCache.delete(
    chave
);

return null;

}


return item;

}



async function sendNYXMedia(
    sock,
    destino,
    conteudo,
    quotedMsg = null
){


const contextoNewsletter =
sendNYX.obterContextoNewsletter();


const contextInfo =
criarContextInfo(
    contextoNewsletter,
    quotedMsg
);


const chaveCache =
obterChaveCache(
    conteudo
);


const cache =
obterCache(
    chaveCache
);



let msg;


// ========================================
// CACHE HIT
// ========================================

if(cache){

console.time(
"NYX_MEDIA_CACHE"
);


// Cria uma cópia para nunca alterar
// o objeto armazenado no cache.

const imageMessage =
{
    ...cache.imageMessage
};


// Caption SEMPRE vem da chamada atual.

imageMessage.caption =
conteudo.caption || "";


// Quote, encaminhada e canal também
// são recriados para cada mensagem.

const contextoMesclado = mesclarContextInfo(
    imageMessage.contextInfo,
    mesclarContextInfo(conteudo.contextInfo, contextInfo)
);

if (contextoMesclado) {
    imageMessage.contextInfo = contextoMesclado;
}


msg =
{
    key:{
        id:
        undefined
    },

    message:{
        imageMessage
    }
};


console.timeEnd(
"NYX_MEDIA_CACHE"
);


console.log(
"NYX MEDIA: CACHE HIT"
);

}



// ========================================
// CACHE MISS
// ========================================

else{


msg =
await generateWAMessage(
    destino,
    conteudo,
    {
        upload:
        sock.waUploadToServer
    }
);


const tipo =
Object.keys(
    msg.message
)[0];


if(
!msg.message[tipo]
){

throw new Error(
"Baileys não gerou conteúdo de mídia"
);

}


// Adiciona o painel NYX à mídia
// recém-gerada.

const contextoMesclado = mesclarContextInfo(
    msg.message[tipo].contextInfo,
    contextInfo
);

if (contextoMesclado) {
    msg.message[tipo].contextInfo = contextoMesclado;
}



// Só armazenamos imageMessage.
// Não armazenamos caption/contextInfo
// como estado definitivo.

if(
chaveCache
&&
tipo === "imageMessage"
){

const imagemCache =
{
    ...msg.message.imageMessage
};


delete imagemCache.caption;

delete imagemCache.contextInfo;


mediaCache.set(
    chaveCache,
    {
        imageMessage:
        imagemCache,

        criadoEm:
        Date.now()
    }
);


}


}



// ========================================
// ENVIO
// ========================================

// Em CACHE HIT não temos uma key criada
// pelo generateWAMessage.
//
// relayMessage aceita um ID criado por nós.

const messageId =
msg.key?.id
||
`NYX_${Date.now()}_${Math.random()
.toString(36)
.slice(2,10)}`;


try {
    await sock.relayMessage(
        destino,
        msg.message,
        {
            messageId
        }
    );
} catch (erro) {
    throw marcarErroTransmissao(erro);
}


}



sendNYXMedia.isTransmissionError = erro =>
    Boolean(erro?.[ERRO_TRANSMISSAO]);



module.exports =
sendNYXMedia;
