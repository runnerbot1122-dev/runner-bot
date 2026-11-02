const { updateIdentity } = require("./users");

function normalizarIdentificador(value) {
    if (typeof value !== "string") return null;
    const texto = value.trim().toLowerCase();
    const at = texto.indexOf("@");
    if (at <= 0) return null;
    const local = texto.slice(0, at).split(":")[0];
    const dominio = texto.slice(at + 1);
    if (!local || !["lid", "s.whatsapp.net", "c.us"].includes(dominio)) return null;
    return `${local}@${dominio}`;
}

async function resolveUser(sock, chat, user) {
    const userNormalizado = normalizarIdentificador(user);
    if (!userNormalizado) return user;
    if (!userNormalizado.endsWith("@lid")) return userNormalizado;

    if (!sock || typeof sock.groupMetadata !== "function" || !chat) return userNormalizado;

    try {
        const metadata = await sock.groupMetadata(chat);
        const participantes = Array.isArray(metadata?.participants) ? metadata.participants : [];

        // Só associa as identidades quando LID e JID aparecem no mesmo registro.
        // Não tenta deduzir um telefone a partir apenas dos dígitos do LID.
        for (const participante of participantes) {
            if (!participante || typeof participante !== "object") continue;
            const ids = [participante.id, participante.lid, participante.jid]
                .map(normalizarIdentificador)
                .filter(Boolean);
            const correspondeAoLid = ids.includes(userNormalizado);
            const jid = ids.find(id => id.endsWith("@s.whatsapp.net") || id.endsWith("@c.us"));
            if (!correspondeAoLid || !jid) continue;

            try {
                updateIdentity(jid, userNormalizado);
            } catch (error) {
                // A resolução é útil mesmo se a persistência de perfil falhar;
                // não expõe identificadores pessoais no log.
            }
            return jid;
        }
    } catch (error) {
        // Falha de metadata não deve inventar uma associação nem derrubar o comando.
    }

    return userNormalizado;
}

module.exports = resolveUser;
