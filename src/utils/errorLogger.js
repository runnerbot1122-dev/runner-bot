const fs = require("fs");
const path = require("path");


const logsDir =
    path.join(
        process.cwd(),
        "logs"
    );


if(
    !fs.existsSync(logsDir)
){

    fs.mkdirSync(
        logsDir,
        {
            recursive:true
        }
    );

}



function registrarErro(dados){


    const texto =

`====================
DATA:
${new Date().toISOString()}

COMANDO:
${dados.command || "desconhecido"}

USUARIO:
${dados.sender || "desconhecido"}

CHAT:
${dados.chat || "desconhecido"}

ERRO:
${dados.error}

====================

`;


    fs.appendFileSync(

        path.join(
            logsDir,
            "errors.log"
        ),

        texto

    );


}



module.exports = {

    registrarErro

};