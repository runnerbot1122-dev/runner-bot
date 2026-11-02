const { getBotName } = require("../../utils/botNameStore");

const {
    getExistingUser,
    getXPProgressReadOnly,
    compararProgressoXP
} = require("../../utils/users");

const {
    calcularXPNecessario
} = require("../../utils/xp");


function barraProgresso(xp, necessario){

    const percentual =
        Math.min(
            100,
            Math.max(
                0,
                necessario > 0
                    ? xp / necessario * 100
                    : 0
            )
        );

    const preenchido =
        Math.round(
            percentual / 10
        );


    return `${"█".repeat(preenchido)}${"░".repeat(10 - preenchido)} ${Math.floor(percentual)}%`;

}


module.exports = {


name:[
    "rank",
    "ranking"
],


description:
"Mostra ranking de XP do grupo",



execute: async(ctx)=>{


if(!ctx.isGroup){

    return ctx.reply(
        "❌ Apenas grupos."
    );

}



const metadata =
    await ctx.sock.groupMetadata(
        ctx.chat
    );



const membros =
    Array.isArray(metadata.participants)
        ? metadata.participants
        : [];



const lista =
[];



for(
    const membro of membros
){

    const jid =
        membro.id ||
        membro.jid ||
        membro.lid;

    const user =
        getExistingUser(
            [
                membro.id,
                membro.lid,
                membro.jid,
                membro.phoneNumber
            ]
        );

    const progresso =
        getXPProgressReadOnly(
            user,
            ctx.chat
        );

    const necessario =
        calcularXPNecessario(
            progresso.level
        );

    lista.push({

        jid:
        jid,

        identifier:
        jid ||
        membro.lid ||
        "",

        nome:
        user?.name
        ||
        membro.notify
        ||
        String(jid || "Desconhecido")
            .split("@")[0],

        xp:
        progresso.xp,

        level:
        progresso.level,

        xpTotal:
        progresso.xpTotal,

        necessario,

        percentual:
        necessario > 0
            ? Math.min(100, Math.max(0, progresso.xp / necessario * 100))
            : 0

    });

}



lista.sort(compararProgressoXP);



const top =
lista.slice(
    0,
    5
);



let texto =
`╭────〔 🏆 RANKING XP 〕────╮\n\n`;



top.forEach(
    (user,index)=>{


texto +=
`${index + 1}º 🏅 @${String(user.jid || user.identifier).split("@")[0]}

⭐ Level: ${user.level}
✨ XP: ${user.xp}/${user.necessario}
💎 Total: ${user.xpTotal}
📊 ${barraProgresso(user.xp, user.necessario)}

`;


    }

);



texto +=
`╰────────────────╯

> ${getBotName()}`;



await ctx.replyNYX(

{

text:

texto,

mentions:

top.map(
    u=>u.jid
).filter(Boolean)

},

"user"

);



}


};