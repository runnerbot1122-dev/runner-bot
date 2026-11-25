const {
    getReactionKeywords
} = require("../utils/groups");

const { getGlobalReactionKeywords } = require("../utils/groups");


const COMMAND_REACTIONS = {
    ping: "🏓",
    perfil: "👤",
    profile: "👤",
    rank: "🏆",
    ranking: "🏆",
    aluguel: "💎",
    rm_aluguel: "💎",
    removealuguel: "💎",
    removeraluguel: "💎",
    lista_aluguel: "💎",
    ver_aluguel: "💎",
    veraluguel: "💎",
    addvip: "💎",
    delvip: "💎",
    viplist: "💎",
    consultar_vip: "💎",
    addcmdvip: "💎",
    delcmdvip: "💎",
    cmdviplist: "💎",
    modoaluguel: "💎",
    setprefix: "⚙️",
    prefixo: "👀",
    setbotname: "⚙️",
    "nome-bot": "⚙️",
    fotomenu: "🖼️",
    fundomenu: "🖼️",
    setmenuimage: "🖼️",
    reiniciar: "🔄",
    restart: "🔄",
    r: "🔄",
    bangp: "⛔",
    unbangp: "✅",
    ban: "👋🏽",
    kick: "👢",
    promover: "🙇🏽",
    rebaixar: "🙇🏽",
    mute: "🤫",
    unmute: "😒",
    antilink: "🔗",
    antipv: "🛡️",
    antipv2: "🛡️",
    antipv3: "🛡️",
    subdonogp: "👑",
    donogp: "👑",
    rmdonogp: "👑",
    seradm: "👀",
    sermembro: "😕",
    blacklist: "🚫",
    blocklist: "🚫",
    rmblacklist: "✅",
    delblacklist: "✅",
    unblacklist: "✅",
    listblacklist: "📋",
    verblacklist: "📋",
    verificado: "✅",
    "verificado-global": "🌐",
    verificadoglobal: "🌐",
    gestao: "⚙️",
    hierarquia: "🏛️",
    hirarquia: "🏛️",
    admin: "🛡️",
    ativadms: "📊",
    play: "🎵",
    fig: "💱",
    regras: "📜",
    menu: "🐺",
    menuadm: "🛡️",
    menudono: "👑",
    menudownload: "📥",
    menubrincadeiras: "🎮",
    menuia: "🤖"
};

const DEFAULT_SUCCESS_REACTION = "✅";


const PREFIX_REACTION = "👀";
const ERROR_REACTION = "❌";


function normalizeTrigger(trigger){

    return String(trigger || "")
        .trim()
        .toLowerCase();

}


async function reactNYX(ctx, emoji){

    if(
        !ctx ||
        !ctx.sock ||
        !ctx.chat ||
        !ctx.message ||
        !emoji
    ){

        return false;

    }


    try {

        await ctx.sock.sendMessage(
            ctx.chat,
            {
                react:{
                    text: String(emoji),
                    key: ctx.message.key
                }
            }
        );


        return true;

    }
    catch(error){

        console.log(
            "Erro ao reagir:",
            error.message
        );

        return false;

    }

}


async function applyAutomaticKeywordReactions(ctx){

    if(
        !ctx ||
        !ctx.chat ||
        !ctx.text
    ){

        return [];

    }


    const mensagem =
        String(ctx.text).trim();


    if(!mensagem){

        return [];

    }


    const gatilhos = getGlobalReactionKeywords();


    if(!Array.isArray(gatilhos) || !gatilhos.length){

        return [];

    }


    const textoLower =
        mensagem.toLowerCase();


    const aplicadas = [];
    const usados = new Set();


    for(const item of gatilhos){

        const trigger =
            String(item && item.trigger || "")
                .trim();

        const emoji =
            item && item.emoji;


        if(!trigger || !emoji){

            continue;

        }


        const normalizado =
            normalizeTrigger(trigger);


        if(
            normalizado &&
            !usados.has(normalizado) &&
            textoLower.includes(normalizado)
        ){

            usados.add(normalizado);
            aplicadas.push({ trigger, emoji });

        }

    }


    for(const item of aplicadas){

        await reactNYX(
            ctx,
            item.emoji
        );

    }


    return aplicadas;

}


function getCommandReaction(command){

    const nome =
        String(command || "")
            .trim()
            .toLowerCase();


    if(!nome){

        return null;

    }


    if (COMMAND_REACTIONS[nome]) return COMMAND_REACTIONS[nome];

    // Prefixos semânticos mantêm reações úteis para aliases e comandos futuros.
    if (/^(add|del|rm|remove|unblock|block|list).*vip/.test(nome)) return "💎";
    if (/^(block|unblock|ban|unban|bangp|unbangp)/.test(nome)) return "🛡️";
    if (/^(set|reset|config|prefix|nome|audio|on$|off$)/.test(nome)) return "⚙️";
    if (/^(menu|list|lista)/.test(nome)) return "📋";
    // Comandos sem reação definida não recebem mais um ✅ genérico.
    // Isso evita substituir a reação personalizada enviada pelo próprio comando.
    return null;

}


async function applyCommandSuccessReaction(ctx){

    if(!ctx || !ctx.command || ctx.customReactionSent){

        return false;

    }


    const emoji =
        getCommandReaction(
            ctx.command
        );


    if(!emoji){

        return false;

    }


    return reactNYX(
        ctx,
        emoji
    );

}


async function applyCommandErrorReaction(ctx){

    return reactNYX(
        ctx,
        ERROR_REACTION
    );

}


async function applyPrefixReaction(ctx){

    return reactNYX(
        ctx,
        PREFIX_REACTION
    );

}


module.exports = {
    reactNYX,
    applyAutomaticKeywordReactions,
    applyCommandSuccessReaction,
    getCommandReaction,
    applyCommandErrorReaction,
    applyPrefixReaction,
    COMMAND_REACTIONS,
    PREFIX_REACTION,
    ERROR_REACTION,
    DEFAULT_SUCCESS_REACTION
};
