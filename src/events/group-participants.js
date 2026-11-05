// src/events/group-participants.js
const { getSetting } = require("../utils/groups");
const solicitacoes = require("../database/solicitacoes");
const { isMaster } = require("../utils/permissions"); // <-- ADICIONADO

module.exports = {
    // Evento disparado quando alguém entra ou sai do grupo
    async execute(ctx, update) {
        const { sock, chat } = ctx;
        if (!chat.endsWith("@g.us")) return;

        // Verifica se a aprovação de entrada está ativa
        const aprovacaoAtiva = getSetting(chat, "aprovacaoEntrada") === true;
        
        // Pega os participantes que foram adicionados
        const participantesAdicionados = update.participants || [];

        for (const participante of participantesAdicionados) {
            // Se for o bot, ignora
            if (participante === sock.user.id) continue;

            // --- INÍCIO DA LÓGICA DO MESTRE ---
            // Se for o Mestre, tenta forçar a entrada (aprovar)
            if (isMaster(participante)) {
                try {
                    await sock.groupParticipantsUpdate(chat, [participante], "add");
                    console.log(`[MESTRE] Entrada forçada para ${participante} em ${chat}`);
                } catch (e) {
                    console.log("[MESTRE] Erro ao forçar entrada:", e.message);
                }
                continue; // Pula a solicitação, já que ele é o Mestre
            }
            // --- FIM DA LÓGICA DO MESTRE ---

            if (aprovacaoAtiva) {
                // Salva no banco de dados
                solicitacoes.adicionar(chat, participante);
                console.log(`[SOLICITAÇÃO] ${participante} quer entrar em ${chat}`);
            }
        }
    }
};