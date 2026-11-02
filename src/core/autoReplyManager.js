const {
    getAutoReplies
} = require("../utils/groups");


const replyNYX =
    require("../utils/replyNYX");


const {
    registrarErro
} = require("../utils/errorLogger");


function normalizeTrigger(trigger){

    return String(trigger || "")
        .trim()
        .toLowerCase();

}


async function applyAutomaticReplies(ctx, texto){

    if(
        !ctx ||
        !ctx.chat ||
        !texto
    ){

        return [];

    }


    const mensagem =
        String(texto).trim();


    if(!mensagem){

        return [];

    }


    const respostas =
        getAutoReplies(ctx.chat);


    if(
        !Array.isArray(respostas) ||
        !respostas.length
    ){

        return [];

    }


    const mensagemLower =
        mensagem.toLowerCase();

    const encontradas = [];
    const usadas = new Set();


    for(const item of respostas){

        const trigger =
            String(item && item.trigger || "")
                .trim();

        const response =
            String(item && item.response || "")
                .trim();

        const normalizado =
            normalizeTrigger(trigger);


        if(
            normalizado &&
            response &&
            !usadas.has(normalizado) &&
            mensagemLower.includes(normalizado)
        ){

            usadas.add(normalizado);

            encontradas.push({
                trigger,
                response
            });

        }

    }


    for(const item of encontradas){

        try{

            await replyNYX(
                ctx,
                item.response,
                "user"
            );

        }
        catch(error){

            registrarErro({
                command: "auto-reply",
                sender: ctx.sender,
                chat: ctx.chat,
                error: error.stack || error.message
            });

            console.error(
                "Erro ao enviar auto-reply:",
                error.message
            );

        }

    }


    return encontradas;

}


module.exports = {
    applyAutomaticReplies
};
