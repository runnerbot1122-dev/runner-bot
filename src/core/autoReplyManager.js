const {
    getAutoReplies
} = require("../utils/groups");


const replyNYX =
    require("../utils/replyNYX");


const {
    registrarErro
} = require("../utils/errorLogger");

const cooldowns = new Map();


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


    const encontradas = findAutomaticReplies(ctx.chat, mensagem, { respectCooldown: true });


    for(const item of encontradas){

        try{

            await replyNYX(
                ctx,
                item.response,
                "user"
            );
            registrarCooldown(ctx.chat, item);

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

function findAutomaticReplies(chat, texto, options = {}){
    if(!chat || !String(texto || "").trim()) return [];
    const respostas = getAutoReplies(chat);
    if(!Array.isArray(respostas) || !respostas.length) return [];
    const mensagemLower = String(texto).trim().toLowerCase();
    const encontradas = [];
    const usadas = new Set();
    for(const item of respostas){
        const trigger = String(item && item.trigger || "").trim();
        const response = String(item && item.response || "").trim();
        const normalizado = normalizeTrigger(trigger);
        const habilitada = item?.enabled !== false;
        const priority = Number.isInteger(Number(item?.priority)) ? Number(item.priority) : 0;
        const cooldownMs = Number.isFinite(Number(item?.cooldownMs)) ? Math.max(0, Number(item.cooldownMs)) : 0;
        const bloqueada = options.respectCooldown === true && cooldownAtivo(chat, normalizado, cooldownMs);
        if(normalizado && response && habilitada && !bloqueada && !usadas.has(normalizado) && mensagemLower.includes(normalizado)){
            usadas.add(normalizado);
            const registro = { trigger, response };
            Object.defineProperties(registro, {
                priority: { value: priority, enumerable: false },
                cooldownMs: { value: cooldownMs, enumerable: false }
            });
            encontradas.push(registro);
        }
    }
    return encontradas.sort((a, b) => b.priority - a.priority || b.trigger.length - a.trigger.length);
}

function cooldownAtivo(chat, trigger, cooldownMs){
    if(!cooldownMs) return false;
    const chave = `${chat}:${trigger}`;
    const ultimo = cooldowns.get(chave) || 0;
    if(Date.now() - ultimo >= cooldownMs){
        cooldowns.delete(chave);
        return false;
    }
    return true;
}

function registrarCooldown(chat, item){
    if(!item.cooldownMs) return;
    cooldowns.set(`${chat}:${normalizeTrigger(item.trigger)}`, Date.now());
}

function clearCooldowns(){
    cooldowns.clear();
}


module.exports = {
    applyAutomaticReplies,
    findAutomaticReplies,
    clearCooldowns
};
