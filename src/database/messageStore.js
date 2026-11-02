const cache = new Map();
const MAX_CACHE_SIZE = 2000; // Aumentado para suportar mais mensagens

function save(id, data) {
    if (!id) return;

    // 👈 CORREÇÃO CRUCIAL: Se já existe uma mídia salva com esse ID, não deixa texto sobrescrever
    const existente = cache.get(id);
    if (existente && existente.mediaBuffer && !data.mediaBuffer) {
        console.log(`[CACHE] Ignorando texto para não sobrescrever mídia do ID ${id}`);
        return;
    }

    if (cache.size >= MAX_CACHE_SIZE) {
        const primeiraChave = cache.keys().next().value;
        cache.delete(primeiraChave);
    }
    cache.set(id, data);
}

function get(id) {
    return cache.get(id);
}

module.exports = { save, get };