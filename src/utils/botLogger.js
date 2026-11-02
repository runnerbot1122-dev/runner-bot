const fs = require("fs");
const path = require("path");


const logsDir =
    path.join(
        process.cwd(),
        "logs"
    );


if (
    !fs.existsSync(logsDir)
) {

    fs.mkdirSync(
        logsDir,
        {
            recursive: true
        }
    );

}


function registrarLog(dados) {


    const agora =
        new Date()
        .toISOString();


    const texto =

`====================
DATA:
${agora}

COMANDO:
${dados.command}

USUARIO:
${dados.sender}

NIVEL:
${dados.level}

CHAT:
${dados.chat}

====================

`;


    fs.appendFileSync(

        path.join(
            logsDir,
            "commands.log"
        ),

        texto

    );

}



module.exports = {
    registrarLog
};