const jogosAtivos = new Map();

module.exports = {
    iniciarJogo(chat, sender, tipo, dados) {
        jogosAtivos.set(`${chat}_${sender}`, { tipo, dados, ultimaInteracao: 0 });
    },
    getJogo(chat, sender) {
        return jogosAtivos.get(`${chat}_${sender}`);
    },
    getJogoAtivoNoGrupo(chat, tipo) {
        for (const [key, jogo] of jogosAtivos.entries()) {
            if (key.startsWith(`${chat}_`) && jogo.tipo === tipo) {
                return { key, ...jogo };
            }
        }
        return null;
    },
    atualizarInteracao(chat, sender) {
        const jogo = jogosAtivos.get(`${chat}_${sender}`);
        if (jogo) jogo.ultimaInteracao = Date.now();
    },
    encerrarJogo(chat, sender) {
        jogosAtivos.delete(`${chat}_${sender}`);
    }
};