const { jidNormalizedUser } = require("@whiskeysockets/baileys");
const messageStore = require("../database/messageStore");
const logger = require("./logger");
const { desserializarClip, enviarFigurinha } = require("./soundStickerKit");

const NUMERO_DONO_FIXO = "5591981131694";

async function enviarAntideleteParaDono(sock, idMensagemApagada, chatOriginal) {
    const dadosApagados = messageStore.get(idMensagemApagada);

    if (!dadosApagados) {
        console.log(`[DIAG-ANTIDELETE] ❌ NÃO encontrado no cache!`);
        return;
    }

    console.log(`[DIAG-ANTIDELETE] ✅ Encontrado! Tipo: ${dadosApagados.mediaType || "texto"} | ViewOnce: ${dadosApagados.isViewOnce}`);

    let jidDono = `${NUMERO_DONO_FIXO}@s.whatsapp.net`;
    jidDono = jidNormalizedUser(jidDono);
    
    try {
        const [resultado] = await sock.onWhatsApp(jidDono);
        if (resultado?.exists && resultado.jid) jidDono = resultado.jid; 
    } catch (e) {}

    const remetente = dadosApagados.sender || chatOriginal;
    
    let textoAviso = `🚨 *ANTI-DELETE*\n\n`;
    textoAviso += `👤 *Autor:* ${remetente.split("@")[0]}\n`;
    textoAviso += `💬 *Chat:* ${chatOriginal.split("@")[0]}\n`;
    if (dadosApagados.isViewOnce) textoAviso += `👁️ *Visualização Única*\n`;
    textoAviso += `\n*Conteúdo:*\n${dadosApagados.text}`;

    try {
        // 1. ENVIO DE FIGURINHA
        if (dadosApagados.mediaType === "sticker" && dadosApagados.mediaBuffer) {
            await sock.sendMessage(jidDono, { text: textoAviso });
            const clip = desserializarClip(dadosApagados.stickerSound);
            await enviarFigurinha(sock, jidDono, { webp: dadosApagados.mediaBuffer, clip });
            logger.success(`[ANTIDELETE] Figurinha enviada.`);
            return;
        }

        // 2. ENVIO DE MÍDIA (FOTO, VÍDEO, ÁUDIO)
        if (dadosApagados.mediaBuffer && dadosApagados.mediaType) {
            console.log(`[DIAG-ANTIDELETE] 📤 Enviando mídia (${dadosApagados.mediaType})...`);
            const payload = { caption: textoAviso };

            if (dadosApagados.mediaType === "image") payload.image = dadosApagados.mediaBuffer;
            if (dadosApagados.mediaType === "video") payload.video = dadosApagados.mediaBuffer;
            
            if (dadosApagados.mediaType === "audio") {
                payload.audio = dadosApagados.mediaBuffer;
                payload.mimetype = 'audio/mp4'; 
                payload.ptt = true; 
            }

            await sock.sendMessage(jidDono, payload);
            logger.success(`[ANTIDELETE] Mídia enviada.`);
            return;
        }

        // 3. ENVIO DE TEXTO PURO
        await sock.sendMessage(jidDono, { text: textoAviso });
        logger.success(`[ANTIDELETE] Texto enviado.`);

    } catch (erro) {
        console.log(`[DIAG-ANTIDELETE] ❌ ERRO NO ENVIO: ${erro.message}`);
        if (sock.user?.lid) {
            try {
                const jidLid = sock.user.lid.split(':')[0] + "@lid";
                await sock.sendMessage(jidLid, { text: textoAviso });
            } catch (erro2) {}
        }
    }
}

module.exports = { enviarAntideleteParaDono };
