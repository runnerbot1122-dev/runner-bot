function normalizarIdentificador(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    const texto = value.trim().toLowerCase();
    const partes = texto.split("@");
    if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
    return `${partes[0].split(":")[0]}@${partes[1]}`;
}

function identidadesDoParticipante(participante) {
    return [...new Set([participante?.id, participante?.jid, participante?.lid]
        .map(normalizarIdentificador).filter(Boolean))];
}

function encontrarParticipante(metadata, identificadores) {
    const procurados = (Array.isArray(identificadores) ? identificadores : [identificadores])
        .map(normalizarIdentificador).filter(Boolean);
    if (!procurados.length) return null;
    return (metadata?.participants || []).find(participante =>
        identidadesDoParticipante(participante).some(id => procurados.includes(id))
    ) || null;
}

function jidTelefonico(participante) {
    return identidadesDoParticipante(participante).find(id =>
        id.endsWith("@s.whatsapp.net") || id.endsWith("@c.us")
    ) || null;
}

function resultadoConfirmado(resultado, identidadesEsperadas) {
    if (!Array.isArray(resultado)) return false;
    const esperadas = (Array.isArray(identidadesEsperadas) ? identidadesEsperadas : [identidadesEsperadas])
        .map(normalizarIdentificador).filter(Boolean);
    if (!esperadas.length) return false;
    return resultado.some(item => item && String(item.status) === "200" &&
        esperadas.includes(normalizarIdentificador(item.jid)));
}

module.exports = { normalizarIdentificador, identidadesDoParticipante, encontrarParticipante, jidTelefonico, resultadoConfirmado };
