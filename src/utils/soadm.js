const {
    getSetting,
    setSetting
} = require("./groups");



function ativar(
    grupo
){

    setSetting(
        grupo,
        "soadm",
        true
    );

}



function desativar(
    grupo
){

    setSetting(
        grupo,
        "soadm",
        false
    );

}



function status(
    grupo
){

    return getSetting(
        grupo,
        "soadm"
    );

}



module.exports = {

    ativar,

    desativar,

    status

};