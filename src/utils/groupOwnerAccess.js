const securityGroups = require("../database/securityGroups");
const users = require("./users");
const {
    normalizarIdentificador,
    identidadesDoParticipante,
    encontrarParticipante
} = require("./participantIdentity");

async function verificarDonoDoGrupo(sock, groupId, sender) {
    const identidade = normalizarIdentificador(sender);

    if (!identidade || !sock || typeof sock.groupMetadata !== "function") {
        return { autorizado: false, metadata: null };
    }

    try {
        const metadata = await sock.groupMetadata(groupId);
        const participante = encontrarParticipante(metadata, [identidade]);

        const identidades = new Set([identidade]);

        if (participante) {
            for (const id of identidadesDoParticipante(participante)) {
                identidades.add(id);
            }
        }

        // Usa somente vínculos JID/LID que já estão gravados no banco.
        const usuario = users.getExistingUser([...identidades]);

        if (usuario) {
            const jid = normalizarIdentificador(usuario.jid);
            const lid = normalizarIdentificador(usuario.lid);

            if (jid) identidades.add(jid);
            if (lid) identidades.add(lid);
        }

        let autorizado = false;

        for (const id of identidades) {
            if (securityGroups.isGroupOwnerStrict(groupId, id)) {
                autorizado = true;
                break;
            }
        }

        return { autorizado, metadata };
    } catch (erro) {
        console.error(
            "[GROUP-OWNER] Não foi possível confirmar o dono do grupo:",
            erro?.message || erro
        );

        return { autorizado: false, metadata: null };
    }
}

module.exports = { verificarDonoDoGrupo };