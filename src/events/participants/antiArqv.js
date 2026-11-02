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

// 🛡️ CACHE DE AUTORES (Para quando o WhatsApp não manda o author)
const ultimoAutorCache = new Map();

function salvarUltimoAutor(groupId, jid) {
    if (!groupId || !jid) return;
    ultimoAutorCache.set(groupId, jid);
    setTimeout(() => ultimoAutorCache.delete(groupId), 10000); // Limpa após 10s
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
    console.log("[ANTI-ARQV] Evento recebido:", {
        id: update?.id,
        action: update?.action,
        author: update?.author,
        participants: update?.participants
    });

    const groupId = update?.id;
    const acao = update?.action;

    if (typeof groupId !== "string" || !groupId.endsWith("@g.us")) return;
    if (acao !== "promote" && acao !== "demote") return;
    if (!security.isAntiArqvEnabled(groupId)) return;

    const participantesAlterados = Array.isArray(update.participants) ? update.participants : [];
    if (!participantesAlterados.length) return;

    // 🚨 NOVO: Se o author veio vazio, busca do cache
    let authorReal = update.author;
    if (!authorReal) {
        authorReal = obterUltimoAutor(groupId);
        if (authorReal) {
            console.log("[ANTI-ARQV] Author vazio, recuperado do cache:", authorReal);
        } else {
            console.warn("[ANTI-ARQV] Evento sem autor identificável e sem cache.");
            return;
        }
    }

    let metadata;
    try {
        metadata = await sock.groupMetadata(groupId);
    } catch (erro) {
        console.error("[ANTI-ARQV] Não foi possível consultar os dados do grupo:", erro?.message || erro);
        return;
    }

    const autorInformado = normalizarIdentificador(authorReal);
    const autorInfo = encontrarParticipante(metadata, [autorInformado]);

    if (!autorInfo) {
        console.warn("[ANTI-ARQV] Autor não localizado nos metadados.");
        return;
    }

    const identidadesAutor = identidadesDoParticipante(autorInfo);
    const autorJid = jidTelefonico(autorInfo);

    if (!autorJid || !["admin", "superadmin"].includes(autorInfo.admin)) {
        console.warn("[ANTI-ARQV] Autor sem identidade telefônica mapeada ou sem cargo administrativo.");
        return;
    }

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

    if (perm?.master || perm?.owner || donoDoGrupo) {
        console.log("[ANTI-ARQV] Autor autorizado. Nenhuma punição executada.");
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
        if (ids.some(id => identidadesAutor.includes(id))) continue;
        if (!jidTelefonico(participante)) continue;

        const duplicado = alvos.some(item =>
            identidadesDoParticipante(item).some(id => ids.includes(id))
        );
        if (!duplicado) alvos.push(participante);
    }

    if (!alvos.length) {
        console.warn("[ANTI-ARQV] Nenhum participante pôde ser identificado com segurança.");
        return;
    }

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
        const identidadesBot = obterIdentidadesBot(sock);
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

        // CASO ESPECIAL: TENTARAM REBAIXAR O PRÓPRIO BOT
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
