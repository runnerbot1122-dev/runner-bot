const fonteNYX = require("../../utils/fonteNYX");
const sendNYX = require("../../utils/sendNYX");
const { getSetting } = require("../../utils/groups");
const { isMaster } = require("../../utils/permissions");
const { getUserByLid, getUserByJid } = require("../../utils/users");

const processados = new Set();

async function welcome(sock, update) {
    const { id, participants, action } = update;

    if (action === "add") {
        // Lista negra por grupo.
        try {
            const security = require("../../database/securityGroups");
            const { isOwner } = require("../../utils/permissions");
            for (const participante of (participants || [])) {
                const user = typeof participante === "string" ? participante : (participante.id || participante.jid);
                if (!user || isOwner(user) || security.isSubowner(id, user) || !security.isBlacklisted(id, user)) continue;
                try {
                    const result = await sock.groupParticipantsUpdate(id, [user], "remove");
                    const confirmed = Array.isArray(result) && result.some(r => r && r.status === "200" && (r.jid === user || !r.jid));
                    if (confirmed) {
                        await sendNYX(sock, id, fonteNYX(`🚫 @${user.split("@")[0]} foi removido por estar na lista negra deste grupo.`), null, [user]);
                    }
                } catch (_) {}
            }
        } catch (e) {}

        const chaveEvento = `${id}-add-${JSON.stringify(participants)}`;
        if (processados.has(chaveEvento)) return;
        processados.add(chaveEvento);
        setTimeout(() => processados.delete(chaveEvento), 10000);

        let nomeGrupo = "Grupo";
        try {
            const metadata = await sock.groupMetadata(id);
            nomeGrupo = metadata.subject || "Grupo";
        } catch (_) {}

        const ativo = getSetting(id, "welcome");
        const legendaSalva = getSetting(id, "legendabv");

        for (const participante of participants) {
            const user = typeof participante === "string" ? participante : participante.id;
            if (!user) continue;

            let ehMestre = isMaster(user);
            
            if (!ehMestre && user.endsWith("@lid")) {
                try {
                    const dbUser = getUserByLid(user) || getUserByJid(user);
                    if (dbUser && dbUser.jid && isMaster(dbUser.jid)) {
                        ehMestre = true;
                    }
                } catch (e) {}
            }

            if (ehMestre) {
                const textoMestre = 
`╭───「 ⭐ ᴄʀɪᴀᴅᴏʀ / ᴍᴇsᴛʀᴇ ⭐ 」───╮

┊ ➤ 👑 O MESTRE ACABOU DE ENTRAR.

╭──────────────────────╮
┊ ➤ ✅ CRIADOR OFICIAL RECONHECIDO.
┊ ➤ 🔓 ACESSO DE DONO LIBERADO.
╰──────────────────────╯

╰───「 DEV EZ 」───╯`;

                await sendNYX(sock, id, fonteNYX(textoMestre), null, [user]);
                continue; 
            }

            if (!ativo) continue;

            let mensagemFinal;
            if (legendaSalva) {
                const numeroLimpo = user.split("@")[0];
                mensagemFinal = legendaSalva
                    .replace(/#numero/gi, `@${numeroLimpo}`)
                    .replace(/#grupo/gi, nomeGrupo);
            } else {
                mensagemFinal = `👋 Bem-vindo(a) @${user.split("@")[0]}!\n\nVocê entrou no grupo. Aproveite!`;
            }

            await sendNYX(sock, id, fonteNYX(mensagemFinal), null, [user]);
        }
    }

    if (action === "remove") {
        const ativo = getSetting(id, "welcome");
        if (!ativo) return;

        const chaveEvento = `${id}-remove-${JSON.stringify(participants)}`;
        if (processados.has(chaveEvento)) return;
        processados.add(chaveEvento);
        setTimeout(() => processados.delete(chaveEvento), 10000);

        let nomeGrupo = "Grupo";
        try {
            const metadata = await sock.groupMetadata(id);
            nomeGrupo = metadata.subject || "Grupo";
        } catch (_) {}

        const legendaSalva = getSetting(id, "legendasaida");

        for (const participante of participants) {
            const user = typeof participante === "string" ? participante : participante.id;
            if (!user) continue;

            let mensagemFinal;
            if (legendaSalva) {
                const numeroLimpo = user.split("@")[0];
                mensagemFinal = legendaSalva
                    .replace(/#numero/gi, `@${numeroLimpo}`)
                    .replace(/#grupo/gi, nomeGrupo);
            } else {
                mensagemFinal = `👋 @${user.split("@")[0]} saiu do grupo. Até logo!`;
            }

            await sendNYX(sock, id, fonteNYX(mensagemFinal), null, [user]);
        }
    }
}

module.exports = welcome;