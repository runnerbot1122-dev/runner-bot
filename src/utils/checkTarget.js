const {
    isOwner
} = require("./permissions");



function normalizar(id){
    if (!id) return null;
    const texto = String(id).trim().toLowerCase();
    const [parte, dominio] = texto.split("@");
    if (!parte || !dominio) return texto;
    // Preserve the identity namespace: a LID must never collide with a phone JID.
    return `${parte.split(":")[0]}@${dominio}`;
}



function getTarget(ctx){

    let alvo = null;



    // =========================================
    // RESPOSTA DE MENSAGEM
    // =========================================

    const quotedContext = ctx.message
        ?.message
        ?.extendedTextMessage
        ?.contextInfo;

    const quotedParticipant = quotedContext?.participantAlt || quotedContext?.participant;



    if(
        quotedParticipant
    ){

        alvo =
        quotedParticipant;

    }



    // =========================================
    // MENÇÃO
    // =========================================

    const mentioned =

    ctx.message
        ?.message
        ?.extendedTextMessage
        ?.contextInfo
        ?.mentionedJid;



    if(
        !alvo
        &&
        mentioned
        &&
        mentioned.length
    ){

        alvo =
        mentioned[0];

    }



    return alvo;

}






function podePunir(
    ctx,
    alvo
){

const alvoLimpo = normalizar(alvo);
const botIds = [
    ctx.sock?.user?.id,
    ctx.sock?.user?.lid,
    ctx.sock?.user?.jid
].filter(Boolean).map(normalizar);

// Fail closed when target is the bot under any identity explicitly exposed
// by Baileys. Do not compare only digits: JID and LID are separate namespaces.
if (alvoLimpo && botIds.includes(alvoLimpo)) {

    return {
        permitido:false,
        motivo:"bot"
    };

}

// A resolução de um LID para um JID exige metadados assíncronos, enquanto
// podePunir é deliberadamente síncrona e usada por vários comandos/eventos.
// Até que exista um mapeamento confiável disponível, falhamos de forma segura:
// nenhum alvo identificado apenas como LID pode sofrer punição automática.
// Isso evita punir o proprietário ou o próprio bot quando o Baileys entrega LID.
if (alvoLimpo && alvoLimpo.endsWith("@lid")) {
    return {
        permitido: false,
        motivo: "identidade_lid_nao_verificada"
    };
}

// Subdonos são protegidos de punições executadas pelo bot no grupo em que foram cadastrados.
try {
    if (ctx?.isGroup && (require("../database/securityGroups").isSubowner(ctx.chat, alvo) || require("../database/securityGroups").isGroupOwner(ctx.chat, alvo))) {
        return { permitido: false, motivo: "subdono_ou_dono_grupo" };
    }
} catch (_) {
    // Falha segura: se a proteção não puder ser consultada, não autorizar punição.
    return { permitido: false, motivo: "protecao_subdono_indisponivel" };
}

if(isOwner(alvo)){

        return {
            permitido:false,
            motivo:"dono"
        };

}



return {
    permitido:true
};

}



module.exports = {

    getTarget,

    podePunir

};
