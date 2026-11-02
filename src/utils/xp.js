const {
    addXP,
    getUser,
    getXPProgress
} = require("./users");

const {
    getSetting
} = require("./groups");



// usuários em cooldown
const cooldown =
{};

const COOLDOWN_MS =
    30000;

const STREAK_WINDOW_MS =
    10 * 60 * 1000;

const MAX_STREAK =
    100;

const MAX_STREAK_BONUS =
    5;

const recentMessages =
    {};


function calcularXPNecessario(level){

    return Math.max(
        100,
        Number(level || 1) * 100
    );

}


function normalizarTexto(texto){

    return String(texto || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}

function normalizarConteudoFarm(texto){

    return normalizarTexto(texto)
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ")
        .trim();

}


function calcularBonusStreak(streak){

    return Math.min(
        MAX_STREAK_BONUS,
        Math.max(
            0,
            Number(streak || 0) - 1
        )
    );

}


function calcularStreak(progresso, agora){

    const ultima =
        progresso &&
        progresso.lastMessageAt
            ? Date.parse(
                progresso.lastMessageAt
            )
            : NaN;

    const dentroDaJanela =
        Number.isFinite(ultima) &&
        agora - ultima <= STREAK_WINDOW_MS;

    const streak =
        dentroDaJanela
            ? Math.min(
                MAX_STREAK,
                Math.max(
                    1,
                    Number(progresso.streak || 0) + 1
                )
            )
            : 1;


    return {
        streak,
        bonus: calcularBonusStreak(streak),
        lastMessageAt: new Date(agora).toISOString()
    };

}


function ganharXP(
    jid,
    grupo,
    texto
){

    if(
        grupo &&
        getSetting(
            grupo,
            "xpEnabled"
        ) === false
    ){

        return null;

    }


    const agora =
        Date.now();

    const chave =
        `${grupo || "global"}:${jid}`;

    const mensagem =
        normalizarTexto(texto);

    const fingerprint =
        normalizarConteudoFarm(texto);


    // 30 segundos entre ganhos
    if(
        cooldown[chave] &&
        agora - cooldown[chave] < COOLDOWN_MS
    ){

        return null;

    }


    if(
        fingerprint &&
        recentMessages[chave] &&
        recentMessages[chave].some(
            item =>
                item.texto === fingerprint &&
                agora - item.quando < STREAK_WINDOW_MS
        )
    ){

        return null;

    }


    cooldown[chave] =
        agora;


    if(fingerprint){

        if(!recentMessages[chave]){
            recentMessages[chave] = [];
        }

        recentMessages[chave] =
            recentMessages[chave]
                .filter(
                    item =>
                        agora - item.quando < STREAK_WINDOW_MS
                )
                .slice(-4);

        recentMessages[chave].push({
            texto: fingerprint,
            quando: agora
        });

    }


    const quantidade =
        Math.floor(
            Math.random() * 10
        ) + 5;



    const progressoAtual =
        getXPProgress(
            getUser(jid),
            grupo
        );

    const streak =
        calcularStreak(
            progressoAtual,
            agora
        );

    const resultado =
        addXP(
            jid,
            quantidade +
            streak.bonus,
            grupo,
            calcularXPNecessario,
            {
                streak: streak.streak,
                lastMessageAt: streak.lastMessageAt
            }
        );



    return {

        xp:
        quantidade +
        streak.bonus,

        baseXP:
        quantidade,

        streak:
        streak.streak,

        streakBonus:
        streak.bonus,

        user:
        resultado.user,

        subiu:
        resultado.subiu,

        levelsGained:
        resultado.levelsGained,

        previousLevel:
        resultado.previousLevel,

        newLevel:
        resultado.newLevel,

        rewardsEarned:
        resultado.rewardsEarned,

        progress:
        resultado.progress

    };

}



module.exports = {

    ganharXP,

    calcularXPNecessario,

    calcularBonusStreak,

    STREAK_WINDOW_MS,

    MAX_STREAK_BONUS

};