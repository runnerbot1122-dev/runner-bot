const {
    getSetting,
    setSetting
} = require("./groups");



function ativar(
    grupo
){

    setSetting(
        grupo,
        "x9",
        true
    );

}



function desativar(
    grupo
){

    setSetting(
        grupo,
        "x9",
        false
    );

}



function status(
    grupo
){

    return getSetting(
        grupo,
        "x9"
    );

}



module.exports = {

    ativar,

    desativar,

    status

};
