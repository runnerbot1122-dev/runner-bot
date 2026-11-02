const config = require("../config/config");

// Normaliza valores de configuração de telefone (número puro ou JID telefônico).
// Não usar para identidades recebidas: essas exigem um JID canônico.
function normalizarConfiguracaoTelefone(numero) {
    const texto = String(numero ?? "").trim().toLowerCase();
    if (!texto) return "";

    if (texto.includes("@")) {
        return normalizarJidTelefone(texto);
    }

    // Configuração aceita formatação visual, mas não letras nem outros símbolos.
    if (!/^\+?[\d\s().-]+$/.test(texto)) return "";
    const digitos = texto.replace(/\D/g, "");
    return digitos.length >= 10 && digitos.length <= 15 ? digitos : "";
}

// Só aceita JIDs telefônicos explícitos. O identificador local pode ser
// N ou N:device; não removemos caracteres inválidos silenciosamente.
function normalizarJidTelefone(numero) {
    const texto = String(numero ?? "").trim().toLowerCase();
    if (!texto) return "";
    const partes = texto.split("@");
    if (partes.length !== 2) return "";
    if (!["s.whatsapp.net", "c.us"].includes(partes[1])) return "";

    const local = partes[0];
    if (!/^\d+(?::\d+)?$/.test(local)) return "";
    return local.split(":")[0];
}

function masterNumberValido(valor) {
    const bruto = String(valor ?? "").trim();
    if (!bruto || !/^\+?[\d\s().-]+$/.test(bruto)) return "";
    const digitos = bruto.replace(/\D/g, "");
    return digitos.length >= 10 && digitos.length <= 15 ? digitos : "";
}

function normalizarLid(valor) {
    const texto = String(valor ?? "").trim().toLowerCase();
    const partes = texto.split("@");

    if (partes.length !== 2 || partes[1] !== "lid") {
        return "";
    }

    // Um sufixo de dispositivo pode aparecer no LID; a identidade-base
    // continua sendo o LID completo, separado dos JIDs telefônicos.
    const local = partes[0] || "";
    if (!/^\d+(?::\d+)?$/.test(local)) return "";
    const identificador = local.split(":")[0];
    return `${identificador}@lid`;
}

function isMaster(jid) {
    if (!jid) return false;
    const masterNumber = masterNumberValido(config.masterNumber || process.env.MASTER_NUMBER);
    if (!masterNumber) return false;
    const remetentes = (Array.isArray(jid) ? jid : [jid]).filter(Boolean);
    return remetentes.some(remetente => {
        const identificador = String(remetente ?? "").trim().toLowerCase();
        if (!identificador || identificador.endsWith("@lid")) return false;
        const numero = normalizarJidTelefone(identificador);
        return Boolean(numero) && numero === masterNumber;
    });
}

function isOwner(jid) {
    if (!jid) return false;
    if (isMaster(jid)) return true;

    const remetentes = (Array.isArray(jid) ? jid : [jid]).filter(Boolean);
    const donosTelefone = [
        config.owner,
        ...(Array.isArray(config.owners) ? config.owners : [])
    ].map(normalizarConfiguracaoTelefone).filter(Boolean);
    const donosLid = (Array.isArray(config.ownerLids) ? config.ownerLids : [])
        .map(normalizarLid)
        .filter(Boolean);

    return remetentes.some(remetente => {
        const identificador = String(remetente ?? "").trim().toLowerCase();
        if (!identificador) return false;

        // Um LID só é autorizado quando estiver explicitamente configurado
        // em ownerLids. Nunca convertemos seus dígitos em número telefônico.
        if (identificador.endsWith("@lid")) {
            const lid = normalizarLid(identificador);
            return Boolean(lid && donosLid.includes(lid));
        }

        const numero = normalizarJidTelefone(identificador);
        return Boolean(numero && donosTelefone.includes(numero));
    });
}

function encontrarParticipante(metadata, jid) {
    // Só aceita correspondência exata de JID ou LID. Remover o sufixo
    // de dispositivo (":3") e comparar apenas os dígitos pode associar
    // um LID à pessoa errada e conceder permissões de owner indevidamente.
    return metadata?.participants?.find(participante =>
        participante.id === jid || participante.lid === jid
    );
}

function participanteAdmin(participante) {
    return participante?.admin === "admin" || participante?.admin === "superadmin";
}

async function isAdmin(sock, chat, jid) {
    if (!chat?.endsWith("@g.us")) return false;

    const metadata = await sock.groupMetadata(chat);
    return participanteAdmin(encontrarParticipante(metadata, jid));
}

async function verificarNivel(sock, chat, jid) {
    const permissions = await getPermissions(sock, chat, jid);
    return permissions.level;
}

async function getPermissions(sock, chat, jid, identidadesAlternativas = []) {
    const candidatos = [
        ...(Array.isArray(jid) ? jid : [jid]),
        ...(Array.isArray(identidadesAlternativas) ? identidadesAlternativas : [identidadesAlternativas])
    ].filter(Boolean);

    if (isMaster(candidatos)) {
        return { master: true, owner: true, admin: true, level: "master" };
    }

    if (isOwner(candidatos)) {
        return { master: false, owner: true, admin: true, level: "owner" };
    }

    if (!chat?.endsWith("@g.us")) {
        return { master: false, owner: false, admin: false, level: "member" };
    }

    const metadata = await sock.groupMetadata(chat);
    // Baileys pode representar o participante como { id: JID, lid: LID }
    // ou { id: LID, jid: JID }. Só associamos identidades presentes no mesmo
    // registro de participante; nunca inferimos equivalência pelos dígitos.
    const participante = metadata?.participants?.find(p =>
        candidatos.some(identificador =>
            p.id === identificador || p.lid === identificador || p.jid === identificador
        )
    );
    const candidatoLid = candidatos.find(identificador =>
        String(identificador).toLowerCase().endsWith("@lid") &&
        (participante?.id === identificador || participante?.lid === identificador)
    );
    const jidMapeado = participante && (
        participante.id && !String(participante.id).toLowerCase().endsWith("@lid")
            ? participante.id
            : participante.jid && !String(participante.jid).toLowerCase().endsWith("@lid")
                ? participante.jid
                : ""
    );
    const ownerPorMapeamentoConfiavel = Boolean(candidatoLid && jidMapeado && isOwner(jidMapeado));
    const admin = Boolean(ownerPorMapeamentoConfiavel) || participanteAdmin(participante);
    const owner = Boolean(ownerPorMapeamentoConfiavel);

    return {
        master: false,
        owner,
        admin,
        level: owner ? "owner" : admin ? "admin" : "member"
    };
}

module.exports = {
    isMaster,
    isOwner,
    isAdmin,
    verificarNivel,
    getPermissions
};
