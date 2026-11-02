const {
    requireAdmin
} = require("../../utils/checkPermission");

const {
    getSetting,
    setSetting
} = require("../../utils/groups");


module.exports = {


name:"xp",


description:
"Ativa ou desativa o ganho de XP no grupo",


execute: async(ctx)=>{


requireAdmin(ctx);


if(!ctx.isGroup){

    return ctx.reply(
        "❌ Apenas grupos."
    );

}


const valor =
ctx.args[0];


if(
    valor !== "1" &&
    valor !== "0"
){

    return ctx.reply(
        "❌ Uso: 7xp 1 ou 7xp 0"
    );

}


const ativo =
    getSetting(
        ctx.chat,
        "xpEnabled"
    ) !== false;


const novoEstado =
    valor === "1";


if(
    ativo === novoEstado
){

    return ctx.reply(
        novoEstado
            ? "ℹ️ XP já está ativado neste grupo."
            : "ℹ️ XP já está desativado neste grupo."
    );

}


setSetting(
    ctx.chat,
    "xpEnabled",
    novoEstado
);


return ctx.reply(
    novoEstado
        ? "✅ XP ativado neste grupo."
        : "⛔ XP desativado neste grupo."
);


}


};
