const security = require("../../database/securityGroups");
const permissions = require("../../utils/permissions");
const { enviarCartaoAntiRoubo } = require("../../utils/antiArqvCard");
const {
    normalizarIdentificador,
    identidadesDoParticipante,
    encontrarParticipante,
    jidTelefonico,
    resultadoConfirmado
} = require("../../utils/participantIdentity");

// 🛡️ CACHE DE AUTORES
const ultimoAutorCache = new Map();

function salvarUltimoAutor(groupId, jid) {
    if (!groupId || !jid) return;
    ultimoAutorCache.set(groupId, jid);
    setTimeout(() => ultimoAutorCache.delete(groupId), 10000);
}

function obterUltimoAutor(groupId) {
    return ultimoAutorCache.get(groupId) || null;
}

async function tentarAlterarCargo(sock, groupId, participante, acao) {
    const jid = jidTelefonico(participante);
    const identidades = identidadesDoParticipante(participante);

    if (!jid) {
        console.warn(`[ANTI-ARQV] Participante sem JID telefônico mapeado; ação ${acao} ignorada.`);
        return false;
    }

    try {
        const resultado = await sock.groupParticipantsUpdate(groupId, [jid], acao);
        const confirmado = resultadoConfirmado(resultado, identidades.length ? identidades : [jid]);
        console.log(`[ANTI-ARQV] Resultado da ação ${acao}:`, { confirmado });
        return confirmado;
    } catch (erro) {
        console.error(`[ANTI-ARQV] Falha ao executar ${acao}:`, erro?.message || erro);
        return false;
    }
}

async function tentarRebaixar(sock, groupId, participante) {
    return tentarAlterarCargo(sock, groupId, participante, "demote");
}

async function tentarPromover(sock, groupId, participante) {
    return tentarAlterarCargo(sock, groupId, participante, "promote");
}

function obterIdentidadesBot(sock) {
    return [sock?.user?.id, sock?.user?.lid, sock?.user?.jid]
        .map(normalizarIdentificador)
        .filter(Boolean);
}

async function antiArqv(sock, update) {
    const groupId = update?.id;
    const acao = update?.action;

    if (typeof groupId !== "string" || !groupId.endsWith("@g.us")) return;
    if (acao !== "promote" && acao !== "demote") return;
    if (!security.isAntiArqvEnabled(groupId)) return;

    const participantesAlterados = Array.isArray(update.participants) ? update.participants : [];
    if (!participantesAlterados.length) return;

    let authorReal = update.author;
    if (!authorReal) {
        authorReal = obterUltimoAutor(groupId);
        if (!authorReal) {
            console.warn("[ANTI-ARQV] Evento sem autor identificável.");
            return;
        }
    }

    const autorInformado = normalizarIdentificador(authorReal);
    
    // 🚨 BLINDAGEM ANTI-SUICÍDIO: Se o autor for o próprio bot, ignora!
    const identidadesBot = obterIdentidadesBot(sock);
    if (identidadesBot.includes(autorInformado)) {
        return; // O bot tem passe livre para fazer o que quiser
    }

    let metadata;
    try {
        metadata = await sock.groupMetadata(groupId);
    } catch (erro) {
        console.error("[ANTI-ARQV] Não foi possível consultar os dados do grupo:", erro?.message || erro);
        return;
    }

    const autorInfo = encontrarParticipante(metadata, [autorInformado]);

    if (!autorInfo) {
        console.warn("[ANTI-ARQV] Autor não localizado nos metadados.");
        return;
    }

    const identidadesAutor = identidadesDoParticipante(autorInfo);
    const autorJid = jidTelefonico(autorInfo);

    // Verifica permissões (Master, Owner do Bot, Dono do Grupo)
    let perm;
    try {
        perm = await permissions.getPermissions(sock, groupId, autorInformado, identidadesAutor);
    } catch (erro) {
        console.error("[ANTI-ARQV] Falha ao verificar permissões:", erro?.message || erro);
        return;
    }

    let donoDoGrupo = false;
    try {
        donoDoGrupo = identidadesAutor.some(id => security.isGroupOwnerStrict(groupId, id));
    } catch (erro) {
        console.error("[ANTI-ARQV] Falha ao verificar dono do grupo:", erro?.message || erro);
        return;
    }

    // 🚨 BLINDAGEM DO DONO/MESTRE: Se for o dono, não faz nada.
if (perm?.master || perm?.owner || donoDoGrupo) {
    return;
}

    const alvos = [];
    for (const participanteInformado of participantesAlterados) {
        const identidade = normalizarIdentificador(
            typeof participanteInformado === "string"
                ? participanteInformado
                : participanteInformado?.id || participanteInformado?.jid || participanteInformado?.lid
        );

        const participante = encontrarParticipante(metadata, [identidade]);
        if (!participante) continue;

        const ids = identidadesDoParticipante(participante);
        
        // Se o alvo for o próprio bot, ignora também
        if (ids.some(id => identidadesBot.includes(id))) continue;
        
        if (ids.some(id => identidadesAutor.includes(id))) continue;
        if (!jidTelefonico(participante)) continue;

        const duplicado = alvos.some(item =>
            identidadesDoParticipante(item).some(id => ids.includes(id))
        );
        if (!duplicado) alvos.push(participante);
    }

    if (!alvos.length) return;

    // PROMOÇÃO NÃO AUTORIZADA
    if (acao === "promote") {
        console.warn("[ANTI-ARQV] Promoção não autorizada detectada.");
        const autorRebaixado = await tentarRebaixar(sock, groupId, autorInfo);

        const resultadosAlvos = [];
        for (const alvo of alvos) {
            resultadosAlvos.push({
                participante: alvo,
                rebaixado: await tentarRebaixar(sock, groupId, alvo)
            });
        }

        const todosRebaixados = autorRebaixado && resultadosAlvos.length > 0 && resultadosAlvos.every(item => item.rebaixado);

        try {
            await enviarCartaoAntiRoubo(
                sock, groupId, metadata?.subject || "Desconhecido",
                autorJid, jidTelefonico(alvos[0]), todosRebaixados
            );
        } catch (erro) {
            console.error("[ANTI-ARQV] Falha ao enviar cartão de promoção:", erro?.message || erro);
        }
        return;
    }

    // REBAIXAMENTO NÃO AUTORIZADO
    if (acao === "demote") {
        console.warn("[ANTI-ARQV] Rebaixamento não autorizado detectado.");
        const botInfo = encontrarParticipante(metadata, identidadesBot);

        const botFoiAlvo = Boolean(
            botInfo && alvos.some(alvo =>
                identidadesDoParticipante(alvo).some(id =>
                    identidadesDoParticipante(botInfo).includes(id)
                )
            )
        );

        let autorRebaixado = false;
        let botProtegido = true;
        const resultadosRestauracao = [];

        if (botFoiAlvo) {
            console.warn("[ANTI-ARQV] Tentativa de remover o ADM do próprio bot!");
            const botJaAdmin = ["admin", "superadmin"].includes(botInfo.admin);

            const [resultadoAutor, resultadoBot] = await Promise.all([
                tentarRebaixar(sock, groupId, autorInfo),
                botJaAdmin ? Promise.resolve(true) : tentarPromover(sock, groupId, botInfo)
            ]);

            autorRebaixado = resultadoAutor;
            botProtegido = resultadoBot;
            resultadosRestauracao.push({ participante: botInfo, restaurado: resultadoBot });
        } else {
            for (const alvo of alvos) {
                resultadosRestauracao.push({
                    participante: alvo,
                    restaurado: await tentarPromover(sock, groupId, alvo)
                });
            }
            autorRebaixado = await tentarRebaixar(sock, groupId, autorInfo);
        }

        const todosRestaurados = resultadosRestauracao.length > 0 && resultadosRestauracao.every(item => item.restaurado);

        try {
            await enviarCartaoAntiRoubo(
                sock, groupId, metadata?.subject || "Desconhecido",
                autorJid, jidTelefonico(alvos[0]), autorRebaixado,
                "demote", todosRestaurados
            );
        } catch (erro) {
            console.error("[ANTI-ARQV] Falha ao enviar cartão de rebaixamento:", erro?.message || erro);
        }
    }
}

module.exports = antiArqv;
module.exports.salvarUltimoAutor = salvarUltimoAutor;