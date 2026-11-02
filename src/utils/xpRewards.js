const LEVEL_REWARDS = Object.freeze({
    5: Object.freeze({
        type: "badge",
        id: "level_5",
        name: "Veterano"
    }),

    10: Object.freeze({
        type: "badge",
        id: "level_10",
        name: "Elite"
    }),

    20: Object.freeze({
        type: "badge",
        id: "level_20",
        name: "Mestre"
    }),

    30: Object.freeze({
        type: "badge",
        id: "level_30",
        name: "Lendário"
    }),

    50: Object.freeze({
        type: "badge",
        id: "level_50",
        name: "Imortal"
    }),

    100: Object.freeze({
        type: "badge",
        id: "level_100",
        name: "Transcendente"
    })
});


function normalizarNivel(level){

    const nivel =
        Number(level);


    return Number.isInteger(nivel) &&
        nivel > 0
        ? nivel
        : null;

}


function clonarRecompensa(recompensa){

    return recompensa
        ? {
            ...recompensa
        }
        : null;

}


function getRewardForLevel(level){

    const nivel =
        normalizarNivel(level);


    if(
        nivel === null ||
        !Object.prototype.hasOwnProperty.call(
            LEVEL_REWARDS,
            nivel
        )
    ){

        return null;

    }


    return clonarRecompensa(
        LEVEL_REWARDS[nivel]
    );

}


function hasRewardForLevel(level){

    return Boolean(
        getRewardForLevel(level)
    );

}


function getRewardsForLevels(
    previousLevel,
    newLevel
){

    const inicio =
        normalizarNivel(previousLevel);

    const fim =
        normalizarNivel(newLevel);


    if(
        inicio === null ||
        fim === null ||
        fim <= inicio
    ){

        return [];

    }


    const recompensas = [];


    for(
        let level = inicio + 1;
        level <= fim;
        level++
    ){

        const recompensa =
            getRewardForLevel(level);


        if(recompensa){

            recompensas.push(
                recompensa
            );

        }

    }


    return recompensas;

}


function getConfiguredRewards(){

    return Object.values(
        LEVEL_REWARDS
    ).map(
        clonarRecompensa
    );

}


module.exports = {

    getRewardForLevel,

    hasRewardForLevel,

    getRewardsForLevels,

    getConfiguredRewards

};
