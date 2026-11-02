const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { aplicarMetadados } = require("../../utils/stickerMetadata");

function desembrulharMensagem(mensagem) {
    let atual = mensagem;
    while (atual?.viewOnceMessage || atual?.viewOnceMessageV2 || atual?.documentWithCaptionMessage) {
        atual = atual.viewOnceMessage || atual.viewOnceMessageV2 || atual.documentWithCaptionMessage;
        atual = atual?.message || atual;
    }
    return atual || {};
}

function localizarFigurinha(mensagem) {
    const atual = desembrulharMensagem(mensagem?.message || mensagem);
    if (atual.stickerMessage) return atual.stickerMessage;

    const citada = desembrulharMensagem(
        atual.extendedTextMessage?.contextInfo?.quotedMessage
    );
    return citada.stickerMessage || null;
}

function obterNomeExecutor(ctx) {
    const pushName = String(ctx.message?.pushName || "").trim();
    if (pushName) return pushName.slice(0, 64);

    const remetente = String(ctx.sender || "").split("@")[0].trim();
    return remetente.slice(0, 64) || "Usuário";
}

module.exports = {
    name: ["tk", "take"],
    description: "Renomeia uma figurinha citada com o nome do executor",
    execute: async (ctx) => {
        const figurinha = localizarFigurinha(ctx.message);
        if (!figurinha) {
            return ctx.reply("🏷️ Responda a uma figurinha com 7tk ou 7take.");
        }

        const nome = obterNomeExecutor(ctx);
        await ctx.reply("🏷️ Só um momento, estou preparando sua figurinha.");

        try {
            // Cria o objeto para download nativo
            const mensagemParaBaixar = {
                key: ctx.message.key,
                message: { stickerMessage: figurinha }
            };

            // Baixa o buffer mais rápido
            const buffer = await downloadMediaMessage(
                mensagemParaBaixar,
                "buffer",
                {},
                { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
            );

            if (!buffer || buffer.length === 0) throw new Error("Figurinha vazia.");

            // Aplica os metadados
            const figurinhaRenomeada = await aplicarMetadados(
                buffer,
                nome,
                nome
            );
            
            if (!figurinhaRenomeada || figurinhaRenomeada.length === 0) {
                throw new Error("Figurinha renomeada vazia.");
            }

            // Envia com Ver Canal
            await sendNYXMedia(ctx.sock, ctx.chat, {
                sticker: figurinhaRenomeada,
                packname: nome,
                author: nome
            }, ctx.message);

        } catch (erro) {
            console.error("[TK/TAKE] Erro:", erro.message);
            await ctx.reply("❌ Não consegui renomear essa figurinha. Tente novamente.");
        }
    }
};