const {
    getSetting
} = require("../../utils/groups");


const {
    podePunir
} = require("../../utils/checkTarget");
const resolveUser = require("../../utils/resolveUser");



async function antiLink(ctx){





if(!ctx.isGroup)
return;



const ativo =
getSetting(
    ctx.chat,
    "antilink"
);



if(!ativo)
return;



const texto =
ctx.text;



if(!texto)
return;



const temLink =
/https?:\/\/|www\./i
.test(texto);



if(!temLink)
return;



const alvoReal = await resolveUser(ctx.sock, ctx.chat, ctx.sender);
const protecao = podePunir(ctx, alvoReal);



if(
!protecao.permitido
){

    
return;

}



let grupoFechado = false;
let estadoOriginalConhecido = false;
let grupoEstavaFechado = false;

try{
    // Preserve the pre-existing group mode. Never assume that the group was open.
    try {
        const metadata = await ctx.sock.groupMetadata(ctx.chat);
        if (typeof metadata?.announce === "boolean") {
            estadoOriginalConhecido = true;
            grupoEstavaFechado = metadata.announce;
        }
    } catch (erroMetadata) {
        console.error("Anti-link: nÃ£o foi possÃ­vel confirmar o estado original do grupo; o grupo nÃ£o serÃ¡ reaberto automaticamente.", erroMetadata);
    }

    try{

        // fecha grupo
        await ctx.sock.groupSettingUpdate(

            ctx.chat,

            "announcement"
        );

        grupoFechado = true;
    }
    catch(erroFechamento){

        console.error(
            "Erro antilink ao fechar grupo:",
            erroFechamento
        );

        return;
    }

    try{

        // remove mensagem
        await ctx.delete();

        // remove usuÃ¡rio
        await ctx.sock.groupParticipantsUpdate(

            ctx.chat,

            [
                alvoReal
            ],

            "remove"
        );

        // pequeno atraso para sincronizar WhatsApp
        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );
    }
    catch(erroAposFechamento){

        console.error(
            "Erro antilink apÃ³s fechar grupo:",
            erroAposFechamento
        );
    }
}
finally{

    if(!grupoFechado || !estadoOriginalConhecido){
        // Fail closed: if the prior state could not be determined, do not
        // accidentally open a group that an administrator had restricted.
        return;
    }

    try{
        await ctx.sock.groupSettingUpdate(
            ctx.chat,
            grupoEstavaFechado ? "announcement" : "not_announcement"
        );
        console.log("Anti-link: estado original do grupo restaurado.");
    }
    catch(erroReabertura){
        console.error("Erro antilink ao restaurar o estado original do grupo:", erroReabertura);
    }

}



}



module.exports =
antiLink;
