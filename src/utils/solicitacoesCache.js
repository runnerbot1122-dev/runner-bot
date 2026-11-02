const pendentes = new Map();

function adicionar(grupoId, jid) {
    if (!grupoId || !jid) return;
    if (!pendentes.has(grupoId)) pendentes.set(grupoId, new Set());
    pendentes.get(grupoId).add(jid);
}

function obterTodos(grupoId) {
    return Array.from(pendentes.get(grupoId) || []);
}

function limpar(grupoId) {
    pendentes.delete(grupoId);
}

module.exports = { adicionar, obterTodos, limpar };