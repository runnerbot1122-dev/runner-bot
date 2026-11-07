const { getBotName } = require("./botNameStore");
const fonteNYX = require("./fonteNYX");

async function sendLinkGrupo(ctx, link) {
    const { sock, chat, message } = ctx;

    // Tenta pegar a foto do grupo
    let fotoGrupo = null;
    try {
        fotoGrupo = await sock.profilePictureUrl(chat, "image");
    } catch (e) {}

    let nomeGrupo = "Grupo";
    try {
        const metadata = await sock.groupMetadata(chat);
        nomeGrupo = metadata.subject || "Grupo";
    } catch (e) {}

    // Layout formatado bonito
    const legenda = 
`╭─━━━━━━━━━━╮
   🦇 ── • ─────── • ── 🦇
   *LINK DO GRUPO*
   🦇 ── • ─────── • ── 🦇
╰╌╌╌╌╌ ⚠ ╌╌╌╌╌╯

*${fonteNYX(nomeGrupo)}*

> ${getBotName()}

${link}`; // O link puro aqui faz o WhatsApp criar o card nativo.

    try {
        if (fotoGrupo) {
            await sock.sendMessage(chat, {
                image: { url: fotoGrupo },
                caption: legenda
            }, { quoted: message });
        } else {
            await sock.sendMessage(chat, {
                text: legenda
            }, { quoted: message });
        }
    } catch (error) {
        // Se a foto do grupo falhar, manda só o texto
        await sock.sendMessage(chat, {
            text: legenda
        }, { quoted: message });
    }
}

module.exports = sendLinkGrupo;