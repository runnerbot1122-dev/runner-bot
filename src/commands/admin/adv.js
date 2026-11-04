const { getBotName } = require("../../utils/botNameStore");

const {
addWarn,
getUser,
clearWarns
}
=
require("../../utils/users");


const resolveUser =
require("../../utils/resolveUser");


const {
    requireAdmin
} = require("../../utils/checkPermission");


const {
    podePunir,
    getTarget
} = require("../../utils/checkTarget");


const logger =
require("../../utils/logger");


function alvoValido(alvo){

    return typeof alvo === "string" &&
        /^[^@\s]+@(s\.whatsapp\.net|c\.us|lid)$/i.test(
            alvo.trim()
        );

}



module.exports = {


name:[
"adv",
"advertir"
],


description:
"Adverte um usuário",



execute: async(ctx)=>{

requireAdmin(ctx);



const alvo =
getTarget(ctx);



if(!alvoValido(alvo)){

await ctx.replyNYX(
alvo
    ? "⚠️ Não consegui identificar um usuário válido para advertir."
    : "⚠️ Marque o usuário que deseja advertir.",

"user"

);

return;

}



const alvoReal =
await resolveUser(
ctx.sock,
ctx.chat,
alvo
);


if(!alvoValido(alvoReal)){

await ctx.replyNYX(
"⚠️ Não consegui identificar um usuário válido para advertir.",

"user"

);

return;

}



const protecao =
    podePunir(
        ctx,
        alvoReal
    );


if(
    !protecao.permitido
){

    if(
        protecao.motivo === "bot"
    ){

        await ctx.replyNYX(
`〘 ${getBotName()} 〙

ɴãᴏ ᴘᴏssᴏ ᴍᴇ ᴀᴅᴠᴇʀᴛɪʀ.

> ${getBotName()}`,

"user"
        );

    }


    if(
        protecao.motivo === "dono"
    ){

        await ctx.replyNYX(
`👑 ɴãᴏ ᴘᴏssᴏ ᴀᴅᴠᴇʀᴛɪʀ ᴍᴇᴜ ᴄʀɪᴀᴅᴏʀ.`,

"user"

        );

    }

    return;

}


const usuario =
getUser(
alvoReal
);



const nomeAlvo =
usuario.name ||
alvoReal.split("@")[0];



const motivo =
ctx.args
.filter(
arg =>
!arg.includes("@")
)
.join(" ")
||
"Sem motivo";



const user =
addWarn(
alvoReal,
motivo,
nomeAlvo
);



// =================================================
// LIMITE 3/3
// =================================================

if (user.warnings >= 3) {
    // Não anuncie a remoção nem apague as advertências até a API
    // confirmar que removeu exatamente o alvo esperado.
    let resultado;
    try {
        resultado = await ctx.sock.groupParticipantsUpdate(
            ctx.chat,
            [alvoReal],
            "remove"
        );
    } catch (erro) {
        await ctx.replyNYX(
            "⚠️ O limite de advertências foi atingido, mas não consegui confirmar a remoção. As advertências foram mantidas; verifique o grupo.",
            "user"
        );
        return;
    }

    const remocaoConfirmada = Array.isArray(resultado) &&
        resultado.length === 1 &&
        resultado[0] &&
        typeof resultado[0] === "object" &&
        resultado[0].status === "200" &&
        resultado[0].jid === alvoReal;

    if (!remocaoConfirmada) {
        await ctx.replyNYX(
            "⚠️ O limite de advertências foi atingido, mas a plataforma não confirmou a remoção. As advertências foram mantidas; verifique o grupo.",
            "user"
        );
        return;
    }

    clearWarns(alvoReal);

    try {
        await logger.action(ctx.sock, {
            acao: "☠️ ADV LIMIT",
            executor: ctx.sender,
            alvo: alvoReal,
            grupo: ctx.chat
        });
    } catch (erro) {
        console.error("Falha ao registrar remoção confirmada por limite de advertências.");
    }

    try {
        await ctx.replyNYX({
            text: `〘 @${alvoReal.split("@")[0]} 〙\n\n☠️ ʟɪᴍɪᴛᴇ ᴅᴇ ᴀᴅᴠᴇʀᴛᴇ̂ɴᴄɪᴀs ᴀᴛɪɴɢɪᴅᴏ.\n\nᴜsᴜáʀɪᴏ ʀᴇᴍᴏᴠɪᴅᴏ ᴅᴏ ɢʀᴜᴘᴏ. 🙇‍♂️`,
            mentions: [alvoReal]
        }, "user");
    } catch (erro) {
        console.error("Falha ao enviar confirmação de remoção por limite de advertências.");
    }

    return;
}


// =================================================
// LOG ADV NORMAL
// =================================================


await logger.action(

    ctx.sock,

    {

        acao:
        "⚠️ ADV",

        executor:
        ctx.sender,

        alvo:
        alvoReal,

        grupo:
        ctx.chat,

        motivo:
        motivo

    }

);



// =================================================
// AVISO NO GRUPO
// =================================================


const data =
new Date()
.toLocaleString(
"pt-BR",
{
day:"2-digit",
month:"2-digit",
year:"numeric",
hour:"2-digit",
minute:"2-digit"
}
);



await ctx.replyNYX(
    {
        text:
`╔═━✰『 ᴀᴅᴠᴇʀᴛᴇ̂ɴᴄɪᴀ 』═━✰

║╎⊹ ࣪ ˖ 👤 ▸ @${alvoReal.split("@")[0]}
║╎⊹ ࣪ ˖ 📋 ▸ ᴀᴅᴠᴇʀᴛᴇ̂ɴᴄɪᴀs: *[ ${user.warnings}/3 ]*
║╎⊹ ࣪ ˖ 📝 ▸ ᴍᴏᴛɪᴠᴏ: _${motivo}_
║╎⊹ ࣪ ˖ 📅 ▸ ${data}

║╎⊹ ࣪ ˖ ⚠️ ▸ ᴀᴏ ᴀᴛɪɴɢɪʀ 3 ᴀᴅᴠᴇʀᴛᴇ̂ɴᴄɪᴀs sᴇʀá ʀᴇᴍᴏᴠɪᴅᴏ.

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`,
        mentions: [alvoReal]
    },
    "user"
);


}

};
