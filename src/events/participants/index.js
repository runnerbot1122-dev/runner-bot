const welcome = require("./welcome");
const antiArqv = require("./antiArqv");

const DIAGNOSTICO_PARTICIPANTES = true;

async function participantes(sock, update) {
    console.log("[DIAG-PARTICIPANTES-INDEX] Recebido:", {
        id: update?.id,
        action: update?.action,
        author: update?.author,
        participants: update?.participants
    });

    if (DIAGNOSTICO_PARTICIPANTES) {
        console.log(
            "[DIAG] O evento chegou ao módulo participants/index.js."
        );
    }

    try {
        console.log("[DIAG] Iniciando Anti-Arqv");

        await antiArqv(sock, update);

        console.log("[DIAG] Anti-Arqv terminou");
    } catch (erro) {
        console.error(
            "[DIAG] Erro no Anti-Arqv:",
            erro?.stack || erro
        );

        throw erro;
    }

    try {
        await welcome(sock, update);
    } catch (erro) {
        console.error(
            "[DIAG] Erro no welcome:",
            erro?.stack || erro
        );

        throw erro;
    }
}

module.exports = participantes;