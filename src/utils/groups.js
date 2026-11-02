const database =
require("../database/database");

function ensureGroup(grupo){

    return garantirGrupo(
        grupo
    ).grupo;

}


function garantirGrupo(grupo){

    let alterado =
        false;

    if(!grupo.settings){

        grupo.settings = {};
        alterado = true;

    }


    const padrao = {

        welcome:false,

        antilink:false,

        antiSpam:false,

        antiFlood:false,

        autoRead:false,

        autoTyping:false,

        prefix:"7",

        botOff:false,

        xpEnabled:true,

        soadm:false,

        reactionKeywords:[],

        autoReplies:[],

        visualizarMsg: false

    };


    for(const chave in padrao){

        if(
            grupo.settings[chave] === undefined
        ){

            grupo.settings[chave] =
                padrao[chave];
            alterado = true;

        }

    }


    return {
        grupo,
        alterado
    };

}



function criarGrupo(id, persistir = true){

let alterado =
    false;

if(
!database.groups[id]
){


database.groups[id]={


settings:{


welcome:false,


antilink:false,


antiSpam:false,


antiFlood:false,


autoRead:false,


autoTyping:false,

prefix:"7",

botOff:false,

xpEnabled:true,

reactionKeywords:[]
,


autoReplies:[]


}



};

alterado = true;

}


const resultado =
    garantirGrupo(
        database.groups[id]
    );

database.groups[id] =
    resultado.grupo;

alterado =
    alterado ||
    resultado.alterado;

if(
    persistir &&
    alterado
){

    database.saveGroups();

}


return database.groups[id];


}



function getGroup(id){

    return criarGrupo(id);

}



function setSetting(id, setting, valor){


    const grupo =
        criarGrupo(id, false);

    if(
        grupo.settings[setting] === valor
    ){

        return grupo;

    }

    grupo.settings[setting] =
        valor;


    database.saveGroups();


    return grupo;

}


function getSetting(id, setting){

    const grupo =
        criarGrupo(id);


    return grupo.settings[setting];

}


function getReactionKeywords(id, persistir = true){


    const grupo =
        criarGrupo(id, persistir);


    if(!Array.isArray(grupo.settings.reactionKeywords)){

        grupo.settings.reactionKeywords = [];

        database.saveGroups();

    }


    return grupo.settings.reactionKeywords;

}


function addReactionKeyword(id, trigger, emoji){

    const grupo =
        criarGrupo(id, false);

    const gatilhos =
        getReactionKeywords(id, false);


    const alvo =
        String(trigger || "").trim();


    const valor =
        String(emoji || "").trim();


    if(!alvo || !valor){

        database.saveGroups();

        return null;

    }


    const novoTrigger =
        alvo.toLowerCase();


    const existente =
        gatilhos.findIndex(
            item =>
                String(item && item.trigger || "")
                    .trim()
                    .toLowerCase() === novoTrigger
        );


    if(existente >= 0){

        gatilhos[existente] = {
            trigger: alvo,
            emoji: valor
        };

    }
    else{

        gatilhos.push({
            trigger: alvo,
            emoji: valor
        });

    }


    database.saveGroups();


    return gatilhos;

}


function removeReactionKeyword(id, trigger){

    const gatilhos =
        getReactionKeywords(id);


    const alvo =
        String(trigger || "").trim().toLowerCase();


    const indice =
        gatilhos.findIndex(
            item =>
                String(item && item.trigger || "")
                    .trim()
                    .toLowerCase() === alvo
        );


    if(indice < 0){

        return false;

    }


    gatilhos.splice(indice, 1);

    database.saveGroups();

    return true;

}


function getAutoReplies(id, persistir = true){


    const grupo =
        criarGrupo(id, persistir);


    if(!Array.isArray(grupo.settings.autoReplies)){

        grupo.settings.autoReplies = [];

        database.saveGroups();

    }


    return grupo.settings.autoReplies;

}


function addAutoReply(id, trigger, response){

    const respostas =
        getAutoReplies(id, false);


    const alvo =
        String(trigger || "").trim();


    const texto =
        String(response || "").trim();


    if(!alvo || !texto){

        database.saveGroups();

        return null;

    }


    const normalizado =
        alvo.toLowerCase();


    const existente =
        respostas.findIndex(
            item =>
                String(item && item.trigger || "")
                    .trim()
                    .toLowerCase() === normalizado
        );


    const registro = {
        trigger: alvo,
        response: texto
    };


    if(existente >= 0){

        respostas[existente] =
            registro;

    }
    else{

        respostas.push(
            registro
        );

    }


    database.saveGroups();

    return respostas;

}


function removeAutoReply(id, trigger){

    const respostas =
        getAutoReplies(id);


    const alvo =
        String(trigger || "").trim().toLowerCase();


    const indice =
        respostas.findIndex(
            item =>
                String(item && item.trigger || "")
                    .trim()
                    .toLowerCase() === alvo
        );


    if(indice < 0){

        return false;

    }


    respostas.splice(
        indice,
        1
    );


    database.saveGroups();

    return true;

}


// ==========================================
// REAÇÕES AUTOMÁTICAS GLOBAIS (Salvas dentro de database.groups)
// ==========================================
const GLOBAL_REACTION_ID = "global@config"; // ID fake para salvar no banco de grupos

function getGlobalReactionKeywords(persistir = true) {
    // Garante que a "caixa" global exista dentro de database.groups
    if (!database.groups[GLOBAL_REACTION_ID]) {
        database.groups[GLOBAL_REACTION_ID] = {
            settings: {
                reactionKeywords: []
            }
        };
    }
    
    if (!Array.isArray(database.groups[GLOBAL_REACTION_ID].settings.reactionKeywords)) {
        database.groups[GLOBAL_REACTION_ID].settings.reactionKeywords = [];
    }

    if (persistir) database.saveGroups();
    
    return database.groups[GLOBAL_REACTION_ID].settings.reactionKeywords;
}

function addGlobalReactionKeyword(trigger, emoji) {
    const gatilhos = getGlobalReactionKeywords(false);
    const alvo = String(trigger || "").trim();
    const valor = String(emoji || "").trim();

    if (!alvo || !valor) {
        database.saveGroups();
        return null;
    }

    const novoTrigger = alvo.toLowerCase();
    const existente = gatilhos.findIndex(
        item => String(item && item.trigger || "").trim().toLowerCase() === novoTrigger
    );

    if (existente >= 0) {
        gatilhos[existente] = { trigger: alvo, emoji: valor };
    } else {
        gatilhos.push({ trigger: alvo, emoji: valor });
    }

    database.saveGroups();
    return gatilhos;
}

function removeGlobalReactionKeyword(trigger) {
    const gatilhos = getGlobalReactionKeywords();
    const alvo = String(trigger || "").trim().toLowerCase();

    const indice = gatilhos.findIndex(
        item => String(item && item.trigger || "").trim().toLowerCase() === alvo
    );

    if (indice < 0) return false;

    gatilhos.splice(indice, 1);
    database.saveGroups();
    return true;
}


// ==========================================
// ANTI-DELETE (VISUALIZAR MSG)
// ==========================================
const GLOBAL_VISUALIZAR_ID = "global@config"; // Reutilizando o fake

function isVisualizarAtivo(id) {
    const grupo = database.groups[id];
    return Boolean(grupo?.settings?.visualizarMsg);
}

function setVisualizar(id, enabled) {
    // Garante que o grupo existe no banco antes de mudar a config
    const grupo = criarGrupo(id, false);
    grupo.settings.visualizarMsg = Boolean(enabled);
    database.saveGroups();
    return grupo.settings.visualizarMsg;
}


module.exports = {

criarGrupo,

ensureGroup,

getGroup,

setSetting,

getSetting,

getReactionKeywords,

addReactionKeyword,

removeReactionKeyword

,

getAutoReplies,

addAutoReply,

removeAutoReply,

// Novas funções globais:
getGlobalReactionKeywords,
addGlobalReactionKeyword,
removeGlobalReactionKeyword,
isVisualizarAtivo,
setVisualizar

};