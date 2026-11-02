function normalizarCandidato(identificador) {
    if (typeof identificador !== "string") return null;
    const valor = identificador.trim();
    if (!valor) return null;
    return valor;
}

function obterIdentidadeMensagem(mensagem) {
    const key = mensagem?.key || {};
    const candidatos = [
        key.participantAlt,
        key.remoteJidAlt,
        key.participant,
        key.remoteJid
    ].map(normalizarCandidato).filter(Boolean);

    const jid = candidatos.find(id => id.toLowerCase().endsWith("@s.whatsapp.net") || id.toLowerCase().endsWith("@c.us")) || null;
    const lid = candidatos.find(id => id.toLowerCase().endsWith("@lid")) || null;
    const remoteJid = normalizarCandidato(key.remoteJid);

    return {
        remetente: jid || lid || remoteJid || null,
        jid,
        lid
    };
}

module.exports = { obterIdentidadeMensagem };
