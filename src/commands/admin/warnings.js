const {
    getTarget
} = require("../../utils/checkTarget");

const {
getUser
}
=
require("../../utils/users");

const {
    requireAdmin
} = require("../../utils/checkPermission");



module.exports = {


name:[
"warnings",
"advertencias",
"advlist"
],


description:
"Lista advertências do usuário",



execute: async(ctx)=>{


const mencionado =
getTarget(ctx);


if (
    mencionado &&
    mencionado !== ctx.sender
) {

    requireAdmin(ctx);

}


const alvoReal =
mencionado
||
ctx.sender;



const user =
getUser(alvoReal);



let motivos =
"";


const historico =
    Array.isArray(user.history)
        ? user.history
            .map(
                registro =>
                    typeof registro === "string"
                        ? registro
                        : registro?.reason
            )
            .filter(
                motivo =>
                    typeof motivo === "string" && motivo.trim()
            )
        : [];

const motivosAntigos =
    Array.isArray(user.reasons)
        ? user.reasons.filter(
            motivo =>
                typeof motivo === "string" && motivo.trim()
        )
        : [];

const motivosRegistrados = [
    ...motivosAntigos,
    ...historico
];

if (motivosRegistrados.length) {

    motivos =
        motivosRegistrados
        .map(
            (motivo, i) =>
                String(i + 1) + ". " + motivo
        )
        .join("\n");

} else {

    motivos =
        "Nenhum motivo registrado";

}


await ctx.replyNYX(

{

text:

`⚠️ *Advertências*

👤 Usuário:
@${alvoReal.split("@")[0]}


📌 Quantidade:
[ ${user.warnings} ]


📝 Histórico de motivos:

${motivos}`,

mentions:[

    alvoReal

]

},

"user"

);



}


};