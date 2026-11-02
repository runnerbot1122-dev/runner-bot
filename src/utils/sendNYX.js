const {
    generateWAMessageFromContent
}
=
require("@whiskeysockets/baileys");


const {
    lerMensagemCanal
}
=
require("./channelStore");

const { getBotName } = require("./botNameStore");
const fonteNYX = require("./fonteNYX");



async function sendNYX(
    sock,
    destino,
    texto,
    quotedMsg = null,
    mentions = []
){


const contextoNewsletter =
obterContextoNewsletter();



if(!contextoNewsletter){

const contextoResposta =
quotedMsg
?
{

    quotedMessage:
    quotedMsg.message,


    participant:
    quotedMsg.sender,


    stanzaId:
    quotedMsg.id ||
    "NYX_REPLY"

}
:
null;


await sock.sendMessage(
    destino,
    {

        text:
        texto,


        ...(Array.isArray(mentions)
        &&
        mentions.length > 0
        ?
        {

            mentions

        }
        :
        {}),


        ...(contextoResposta
        ?
        {

            contextInfo:
            contextoResposta

        }
        :
        {})

    }
);


return;

}



const contextInfo =
{

    ...contextoNewsletter,



    ...(Array.isArray(mentions)
    &&
    mentions.length > 0
    ?
    {

        mentionedJid:
        mentions

    }
    :
    {}),



    ...(quotedMsg
    ?
    {

        quotedMessage:
        quotedMsg.message,


        participant:
        quotedMsg.sender,


        stanzaId:
        quotedMsg.id ||
        "NYX_REPLY"

    }
    :
    {})


};



const conteudo =
{

    extendedTextMessage:{

        text:
        texto,

        contextInfo:
        contextInfo

    }

};



const msg =
await generateWAMessageFromContent(
    destino,
    conteudo,
    {}
);



await sock.relayMessage(
    destino,
    msg.message,
    {
        messageId:
        msg.key.id
    }
);



}



function obterContextoNewsletter(){

    let canal;

    try {
        canal = lerMensagemCanal();
    } catch (erro) {
        return null;
    }

    const newsletterJid = canal?.key?.remoteJid;
    const serverMessageId = Number(canal?.serverId);

    if (
        typeof newsletterJid !== "string" ||
        !newsletterJid.endsWith("@newsletter") ||
        !Number.isSafeInteger(serverMessageId) ||
        serverMessageId <= 0
    ) {
        return null;
    }

    try {
        return {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid,
                serverMessageId,
                newsletterName: getBotName(),
                contentType: "UPDATE"
            }
        };
    } catch (erro) {
        return null;
    }
}



// ConvenÃ§Ã£o para novos comandos: use ctx.reply para respostas padrÃ£o.
// A atribuiÃ§Ã£o do canal Ã© anexada somente apÃ³s o roteamento do comando e
// quando hÃ¡ um registro vÃ¡lido; respostas anteriores ao roteamento continuam simples.
async function sendCommandReply(ctx, conteudo){

    const mensagemOriginal =
        typeof conteudo === "string"
            ? { text: conteudo }
            : conteudo;

    // Padroniza fonte em respostas comuns, incluindo legendas, sem alterar URLs.
    const mensagem = mensagemOriginal && typeof mensagemOriginal === "object"
        ? { ...mensagemOriginal }
        : mensagemOriginal;

    if (mensagem && typeof mensagem.text === "string") {
        mensagem.text = fonteNYX(mensagem.text);
    }
    if (mensagem && typeof mensagem.caption === "string") {
        mensagem.caption = fonteNYX(mensagem.caption);
    }

    const enviarSemCanal = () =>
        ctx.sock.sendMessage(ctx.chat, mensagem);

    if (
        typeof ctx.command !== "string" ||
        ctx.command.trim() === ""
    ) {
        return enviarSemCanal();
    }

    const contextInfo = obterContextoNewsletter();

    if (!contextInfo) {
        return enviarSemCanal();
    }

    // Para respostas de texto, use o mesmo caminho do sendNYX/replyNYX:
    // o contexto da newsletter precisa ficar dentro da mensagem de texto
    // (extendedTextMessage.contextInfo), nÃ£o no nÃ­vel externo do payload.
    // MÃ­dias, botÃµes e outros payloads continuam pelo caminho original.
    const somenteTexto =
        mensagem &&
        typeof mensagem === "object" &&
        typeof mensagem.text === "string" &&
        !mensagem.image &&
        !mensagem.video &&
        !mensagem.audio &&
        !mensagem.document &&
        !mensagem.sticker &&
        !mensagem.buttons &&
        !mensagem.templateButtons &&
        !mensagem.sections &&
        !mensagem.viewOnce;

    if (somenteTexto) {
        return sendNYX(
            ctx.sock,
            ctx.chat,
            mensagem.text,
            null,
            Array.isArray(mensagem.mentions) ? mensagem.mentions : []
        );
    }

    const mensagemComCanal = anexarContextoAoConteudo(
        mensagem,
        contextInfo
    );

    if (!mensagemComCanal) {
        return enviarSemCanal();
    }

    return ctx.sock.sendMessage(ctx.chat, mensagemComCanal);
}



function attachNewsletterContext(mensagem){

    const contextInfo = obterContextoNewsletter();

    if (
        !contextInfo ||
        !mensagem ||
        typeof mensagem !== "object"
    ) {
        return false;
    }

    const wrappers = [
        "ephemeralMessage",
        "viewOnceMessage",
        "viewOnceMessageV2",
        "viewOnceMessageV2Extension",
        "documentWithCaptionMessage"
    ];

    for (const wrapper of wrappers) {
        const nested = mensagem[wrapper]?.message;

        if (nested && typeof nested === "object") {
            return attachContextToMessage(nested, contextInfo);
        }
    }

    return attachContextToMessage(mensagem, contextInfo);
}



function attachContextToMessage(mensagem, contextInfo){

    const conteudos = Object.entries(mensagem).filter(
        ([chave, valor]) =>
            chave !== "messageContextInfo" &&
            valor &&
            typeof valor === "object"
    );

    if (conteudos.length !== 1) {
        return false;
    }

    const conteudo = conteudos[0][1];
    conteudo.contextInfo = {
        ...(conteudo.contextInfo || {}),
        ...contextInfo
    };

    return true;
}



function anexarContextoAoConteudo(mensagem, contextInfo){

    if (
        !mensagem ||
        typeof mensagem !== "object" ||
        Array.isArray(mensagem)
    ) {
        return null;
    }

    return {
        ...mensagem,
        contextInfo: {
            ...(mensagem.contextInfo || {}),
            ...contextInfo
        }
    };
}



sendNYX.sendCommandReply = sendCommandReply;
sendNYX.attachNewsletterContext = attachNewsletterContext;
sendNYX.obterContextoNewsletter = obterContextoNewsletter;



module.exports = sendNYX;