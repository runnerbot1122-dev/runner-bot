// src/events/group-participants.js
const { getSetting } = require("../utils/groups");
const solicitacoes = require("../database/solicitacoes");

module.exports = {
    // Evento disparado quando alguém entra ou sai do grupo
    async execute(ctx, update) {
        const { sock, chat } = ctx;
        if (!chat.endsWith("@g.us")) return;

        // Verifica se a aprovação de entrada está ativa
        const aprovacaoAtiva = getSetting(chat, "aprovacaoEntrada") === true;
        if (!aprovacaoAtiva) return;

        // Pega os participantes que foram adicionados
        const participantesAdicionados = update.participants || [];

        for (const participante of participantesAdicionados) {
            // Se for o bot, ignora
            if (participante === sock.user.id) continue;

            // Salva no banco de dados
            solicitacoes.adicionar(chat, participante);

            // (Opcional) Manda uma mensagem no grupo ou no PV do admin
            // Mas como ele ainda está "pendente", o WhatsApp já segura ele.
            console.log(`[SOLICITAÇÃO] ${participante} quer entrar em ${chat}`);
        }
    }
};