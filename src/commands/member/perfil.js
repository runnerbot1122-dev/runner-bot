const { getBotName } = require("../../utils/botNameStore");

const {
    getExistingUser,
    getXPProgressReadOnly,
    compararProgressoXP
} = require("../../utils/users");

const {
    calcularXPNecessario
} = require("../../utils/xp");

const {
    getMentioned
} = require("../../utils/mentions");



module.exports = {


name:[
    "perfil",
    "profile",
    "perfil2"
],


description:
"Mostra perfil do usuário",



execute: async(ctx)=>{


const mencionado =
    getMentioned(
        ctx.message
    );



const alvo =
    mencionado
    ||
    ctx.sender;


const user =
    getExistingUser(
        [
            alvo
        ]
    );

const progresso =
    getXPProgressReadOnly(
        user,
        ctx.isGroup
            ? ctx.chat
            : null
    );

const necessario =
    calcularXPNecessario(
        progresso.level
    );

const xpAtual =
    Math.min(
        progresso.xp,
        necessario
    );

const xpRestante =
    Math.max(
        0,
        necessario - xpAtual
    );

const percentual =
    necessario > 0
        ? Math.min(
            100,
            Math.max(
                0,
                xpAtual / necessario * 100
            )
        )
        : 0;

const preenchido =
    Math.round(
        percentual / 10
    );

const barra =
    `${"█".repeat(preenchido)}${"░".repeat(10 - preenchido)} ${Math.floor(percentual)}%`;

let posicao = null;

if(ctx.isGroup){

    const metadata =
        await ctx.sock.groupMetadata(
            ctx.chat
        );

    const lista =
        (
            Array.isArray(metadata.participants)
                ? metadata.participants
                : []
        )
        .map(
            membro => {

                const identificador =
                    membro.id ||
                    membro.jid ||
                    membro.lid ||
                    "";

                const participante =
                    getExistingUser(
                        [
                            membro.id,
                            membro.lid,
                            membro.jid,
                            membro.phoneNumber
                        ]
                    );

                const participanteProgresso =
                    getXPProgressReadOnly(
                        participante,
                        ctx.chat
                    );

                return {
                    identifier: identificador,
                    user: participante,
                    level: participanteProgresso.level,
                    xpTotal: participanteProgresso.xpTotal,
                    xp: participanteProgresso.xp
                };

            }
        )
        .sort(
            compararProgressoXP
        );

    const alvoUser =
        getExistingUser(
            [alvo]
        );

    const indice =
        lista.findIndex(
            participante =>
                (
                    alvoUser &&
                    participante.user === alvoUser
                )
                ||
                (
                    !alvoUser &&
                    participante.identifier === alvo
                )
        );

    if(indice >= 0){

        posicao = indice + 1;

    }

}

const mensagens =
    user &&
    user.messagesByGroup &&
    typeof user.messagesByGroup[ctx.chat] === "number"
        ? Math.max(0, user.messagesByGroup[ctx.chat])
        : (
            ctx.isGroup
                ? 0
                : Math.max(0, user?.messages || 0)
        );


await ctx.replyNYX(

{

text:

`╭────〔 👤 PERFIL 〕────╮


👤 Usuário:
@${alvo.split("@")[0]}


⭐ Nível:
${progresso.level}


✨ XP:
${xpAtual} / ${necessario}


📌 XP restante:
${xpRestante}


📊 Progresso:
${barra}


💎 XP total:
${progresso.xpTotal}


🏆 Posição:
${posicao ? `#${posicao}` : "Não classificado"}


💬 Mensagens:
${mensagens}


⚠️ Advertências:
${user?.warnings || 0}/3


📅 Criado em:
${(
    user?.createdAt
        ? new Date(user.createdAt)
        : new Date()
).toLocaleDateString("pt-BR")}


╰────────────────╯

> ${getBotName()}`,


mentions:[

    alvo

]

},

"user"

);


}


};
