// Armazena os jogos ativos na memória: { "grupo_jogador": { tipo, dados, ultimaInteracao } }
const jogosAtivos = new Map();

module.exports = {
    iniciarJogo(chat, sender, tipo, dados) {
        jogosAtivos.set(`${chat}_${sender}`, { tipo, dados, ultimaInteracao: 0 });
    },

    getJogo(chat, sender) {
        return jogosAtivos.get(`${chat}_${sender}`);
    },

    atualizarInteracao(chat, sender) {
        const jogo = jogosAtivos.get(`${chat}_${sender}`);
        if (jogo) jogo.ultimaInteracao = Date.now();
    },

    encerrarJogo(chat, sender) {
        jogosAtivos.delete(`${chat}_${sender}`);
    }
};