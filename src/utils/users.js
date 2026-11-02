const database =
require("../database/database");

const {
    getRewardsForLevels
} = require("./xpRewards");



function normalizar(jid){
    if(typeof jid !== "string" || !jid.trim()) return null;
    const value = jid.trim().toLowerCase();
    // Preserve the WhatsApp namespace. Remove only a device suffix (e.g. :12)
    // from the local part; never collapse @lid and @s.whatsapp.net to digits.
    const at = value.indexOf("@");
    if(at < 0) return value;
    const local = value.slice(0, at).split(":")[0];
    const domain = value.slice(at + 1);
    return `${local}@${domain}`;
}

function encontrarChaveUsuario(identificadores){
    const ids = identificadores.filter(Boolean);
    // Prefer explicit stored identity matches. This safely links JID/LID only
    // when a previous updateIdentity call recorded the association.
    const usuarioEncontrado = Object.entries(database.users).find(([, user]) =>
        ids.some(id => user && (user.jid === id || user.lid === id ||
            normalizar(user.jid) === normalizar(id) || normalizar(user.lid) === normalizar(id)))
    );
    if(usuarioEncontrado) return usuarioEncontrado[0];

    // Canonical full-JID keys are safe. Legacy numeric-only keys are ambiguous
    // across namespaces, so do not silently attach them to a new identity.
    for(const identificador of ids){
        const id = normalizar(identificador);
        if(id && database.users[id]) return id;
    }
    return null;
}


function ensureUser(user, nome=null){

    if(!user.name){

        user.name =
            nome || "Desconhecido";

    }

    if(!user.jid){

    user.jid = null;

}


if(!user.lid){

    user.lid = null;

}


    if(
        typeof user.warnings !== "number"
    ){

        user.warnings = 0;

    }


    if(
        !Array.isArray(user.history)
    ){

        user.history = [];

    }


if(
    typeof user.xp !== "number"
){

    user.xp = 0;

}


if(
    typeof user.level !== "number"
){

    user.level = 1;

}


if(
    typeof user.messages !== "number"
){

    user.messages = 0;

}


if(
    typeof user.xpTotal !== "number"
){

    user.xpTotal =
        Math.max(
            0,
            user.xp
            ||
            0
        );

}


if(
    typeof user.messagesTotal !== "number"
){

    user.messagesTotal =
        user.messages;

}


if(
    !user.xpByGroup ||
    typeof user.xpByGroup !== "object" ||
    Array.isArray(user.xpByGroup)
){

    user.xpByGroup = {};

}


if(
    !user.messagesByGroup ||
    typeof user.messagesByGroup !== "object" ||
    Array.isArray(user.messagesByGroup)
){

    user.messagesByGroup = {};

}



    if(!user.createdAt){

        user.createdAt =
            new Date()
            .toISOString();

    }


    if(!user.lastActivity){

        user.lastActivity =
            new Date()
            .toISOString();

    }


    if(!user.lastCommand){

        user.lastCommand = null;

    }


    return user;

}


function getUser(jid, nome=null){


const id =
encontrarChaveUsuario(
    [jid]
)
||
normalizar(jid);



if(!database.users[id]){


database.users[id] = ensureUser({

    name:
        nome || "Desconhecido",

    warnings:0,

    history:[]

}, nome);


database.saveUsers();


}


if(
nome &&
database.users[id].name !== nome
){


database.users[id].name = nome;


database.saveUsers();


}


database.users[id] =
    ensureUser(
        database.users[id],
        nome
    );


return database.users[id];


}

function getUserByJid(jid){

    if(!jid)
        return null;


    const id =
        encontrarChaveUsuario(
            [jid]
        );


    return database.users[id]
        || null;

}

function getUserByLid(lid){

    if(!lid)
        return null;


    return Object
        .values(database.users)
        .find(
            user =>
                user.lid === lid
        )
        || null;

}


function getExistingUser(identificadores){

    const chave =
        encontrarChaveUsuario(
            Array.isArray(identificadores)
                ? identificadores
                : [identificadores]
        );


    return chave
        ? database.users[chave]
        : null;

}


function getXPProgressReadOnly(user, grupo){

    const padrao = {
        xp: 0,
        level: 1,
        xpTotal: 0,
        messages: 0
    };


    if(!user){

        return padrao;

    }


    if(!grupo){

        return {
            xp:
                typeof user.xp === "number"
                ? Math.max(0, user.xp)
                : 0,

            level:
                typeof user.level === "number"
                ? Math.max(1, user.level)
                : 1,

            xpTotal:
                typeof user.xpTotal === "number"
                ? Math.max(0, user.xpTotal)
                : Math.max(0, user.xp || 0),

            messages:
                typeof user.messages === "number"
                ? Math.max(0, user.messages)
                : 0
        };

    }


    const progresso =
        user.xpByGroup &&
        typeof user.xpByGroup === "object" &&
        !Array.isArray(user.xpByGroup)
            ? user.xpByGroup[grupo]
            : null;


    if(!progresso){

        return padrao;

    }


    return {
        xp:
            typeof progresso.xp === "number"
            ? Math.max(0, progresso.xp)
            : 0,

        level:
            typeof progresso.level === "number"
            ? Math.max(1, progresso.level)
            : 1,

        xpTotal:
            typeof progresso.xpTotal === "number"
            ? Math.max(0, progresso.xpTotal)
            : 0,

        messages:
            typeof progresso.messages === "number"
            ? Math.max(0, progresso.messages)
            : 0
    };

}


function compararProgressoXP(a, b){

    return (
        b.level - a.level
    )
    ||
    (
        b.xpTotal - a.xpTotal
    )
    ||
    (
        b.xp - a.xp
    )
    ||
    String(a.identifier)
        .localeCompare(
            String(b.identifier)
        );

}


function getXPProgress(user, grupo){

    if(
        !grupo
    ){

        return {
            xp: user.xp,
            level: user.level,
            xpTotal: user.xpTotal,
            messages: user.messages
        };

    }


    if(
        !user.xpByGroup[grupo]
    ){

        const gruposExistentes =
            Object.keys(
                user.xpByGroup
            ).length;


        user.xpByGroup[grupo] = {
            xp:
                gruposExistentes === 0
                ? user.xp
                : 0,

            level:
                gruposExistentes === 0
                ? user.level
                : 1,

            xpTotal:
                gruposExistentes === 0
                ? user.xpTotal
                : 0,

            messages:
                gruposExistentes === 0
                ? user.messages
                : 0
        };

    }


    const progresso =
        user.xpByGroup[grupo];


    if(typeof progresso.xp !== "number")
        progresso.xp = 0;

    if(typeof progresso.level !== "number")
        progresso.level = 1;

    if(typeof progresso.xpTotal !== "number")
        progresso.xpTotal = progresso.xp;

    if(typeof progresso.messages !== "number")
        progresso.messages = 0;

    if(!Array.isArray(progresso.rewards))
        progresso.rewards = [];

    if(typeof progresso.streak !== "number")
        progresso.streak = 0;

    if(
        typeof progresso.lastMessageAt !== "string" &&
        progresso.lastMessageAt !== null
    ){

        progresso.lastMessageAt = null;

    }


    return progresso;

}


function registrarMensagem(jid, grupo){

    const user =
        getUser(jid);


    user.messagesTotal++;


    if(grupo){

        if(
            typeof user.messagesByGroup[grupo] !== "number"
        ){

            user.messagesByGroup[grupo] = 0;

        }


        user.messagesByGroup[grupo]++;

    }


    database.saveUsers();


    return user;

}

function addWarn(jid, motivo, nome=null){


const user =
getUser(
jid,
nome
);



user.warnings++;



if(motivo){

user.history.push({

reason:motivo,

date:
new Date()
.toLocaleString(
"pt-BR"
)

});

}



database.saveUsers();



return user;


}




function removeWarn(jid){


const user =
getUser(jid);



if(user.warnings > 0){

user.warnings--;

}



database.saveUsers();



return user;


}

function clearWarns(jid){


const user =
    getUser(
        jid
    );



user.warnings = 0;



database.saveUsers();



return user;


}


function updateActivity(jid, comando){

    const user =
        getUser(jid);


    user.lastActivity =
        new Date()
        .toISOString();


    user.lastCommand =
        comando;


    database.saveUsers();


    return user;

}


function updateIdentity(jid, lid){

    const chaveJid = jid ? encontrarChaveUsuario([jid]) : null;
    const chaveLid = lid ? encontrarChaveUsuario([lid]) : null;

    // Não unir perfis distintos só porque chegaram juntos um JID e um LID.
    // A associação só é gravada quando ambos ainda não existem ou apontam
    // para o mesmo registro de usuário.
    if (chaveJid && chaveLid && chaveJid !== chaveLid) {
        throw new Error("IDENTITY_CONFLICT");
    }

    const chave = chaveJid || chaveLid || normalizar(jid || lid);


    if(!database.users[chave]){

        database.users[chave] =
            ensureUser(
                {},
                null
            );

    }


    const user =
        database.users[chave];

    let alterado =
        false;


    if(jid){

        if(user.jid !== jid){
            user.jid = jid;
            alterado = true;
        }

    }


    if(lid){

        if(user.lid !== lid){
            user.lid = lid;
            alterado = true;
        }

    }


    if(alterado){
        database.saveUsers();
    }


    return user;

}


function addXP(
    jid,
    quantidade = 5,
    grupo = null,
    calcularXPNecessario = level => level * 100,
    atividade = {}
){

const user =
    getUser(jid);


const progresso =
    getXPProgress(
        user,
        grupo
    );


progresso.xp += quantidade;


user.messages++;
user.xpTotal += quantidade;
progresso.xpTotal += quantidade;
progresso.messages++;

if(
    typeof atividade.streak === "number"
){

    progresso.streak =
        atividade.streak;

}


if(
    typeof atividade.lastMessageAt === "string"
){

    progresso.lastMessageAt =
        atividade.lastMessageAt;

}


const previousLevel =
progresso.level;


let subiu = false;
let levelsGained = 0;


while(
    progresso.xp >=
    calcularXPNecessario(
        progresso.level
    )
){

    progresso.xp -=
        calcularXPNecessario(
            progresso.level
        );

    progresso.level++;
    subiu = true;
    levelsGained++;

}

const rewardsEarned = [];

if(grupo){

    if(!Array.isArray(progresso.rewards))
        progresso.rewards = [];

    const recompensasDisponiveis =
        getRewardsForLevels(
            previousLevel,
            progresso.level
        );


    for(
        const recompensa of recompensasDisponiveis
    ){

        const jaRecebida =
            progresso.rewards.some(
                reward =>
                    reward === recompensa.id ||
                    (
                        reward &&
                        typeof reward === "object" &&
                        reward.id === recompensa.id
                    )
            );


        if(!jaRecebida){

            progresso.rewards.push(
                recompensa.id
            );

            rewardsEarned.push(
                recompensa
            );

        }

    }

}


user.xp =
    progresso.xp;

user.level =
    progresso.level;


database.saveUsers();



return {

    user,
    subiu,
    levelsGained,
    previousLevel,
    newLevel: progresso.level,
    rewardsEarned,
    progress: progresso

};

}



function getRanking(){

return Object
    .values(
        database.users
    )
    .sort(
        (a,b)=>
            b.xp - a.xp
    );

}




module.exports = {

getUser,

getUserByJid,

getUserByLid,

getExistingUser,

getXPProgressReadOnly,

compararProgressoXP,

getXPProgress,

registrarMensagem,

addWarn,

removeWarn,

clearWarns,

updateActivity,

updateIdentity,

addXP,

getRanking

};