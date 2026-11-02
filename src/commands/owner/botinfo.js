const config =
    require("../../config/config");

const {
    requireOwner
} = require("../../utils/checkPermission");

const { getBotName } = require("../../utils/botNameStore");

const database =
    require("../../database/database");

const path =
    require("path");



module.exports = {


name:"botinfo",


description:
"Informações do bot",



execute: async(ctx)=>{

        requireOwner(ctx);


const usuarios =
    Object.keys(
        database.users
    ).length;



const grupos =
    Object.keys(
        database.groups
    ).length;



const memoria =
(
    process.memoryUsage()
        .heapUsed /
    1024 /
    1024
)
.toFixed(2);



const uptime =
    Math.floor(
        process.uptime()
        /
        60
    );



await ctx.replyNYX(

{

image:{

    url:
    path.join(
        process.cwd(),
        "assets",
        "botinfo.jpg"
    )

},


caption:

`╭━━━〔 ${getBotName()} 〕━━━╮

𝖲𝖸𝖲𝖳𝖤𝖬

Status:
ONLINE

Nome:
${getBotName()}

Versão:
${config.version}


𝖢𝖱𝖤𝖠𝖳𝖮𝖱

${config.creator}


𝖣𝖠𝖳𝖠𝖡𝖠𝖲𝖤

Usuários:
${usuarios}

Grupos:
${grupos}


𝖲𝖤𝖱𝖵𝖤𝖱

Memória:
${memoria} MB

Node:
${process.version}

Uptime:
${uptime} minutos


╰━━━━━━━━━━━━━━╯`

},

"user"

);


}

};
