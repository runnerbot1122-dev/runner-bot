const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { aplicarMetadados } = require("../../utils/stickerMetadata");
const replyNYX = require("../../utils/replyNYX");

let ultimaFrase = -1;

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
    const citada = desembrulharMensagem(atual.extendedTextMessage?.contextInfo?.quotedMessage);
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
            return replyNYX(ctx, 
                `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🏷️ ▸ ʀᴇsᴘᴏɴᴅᴀ ᴀ ᴜᴍᴀ ғɪɢᴜʀɪɴʜᴀ ᴄᴏᴍ *${ctx.prefix}tk* ᴏᴜ *${ctx.prefix}take*.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                "bot");
        }

        const nome = obterNomeExecutor(ctx);
        
        const frasesEspera = [
            "🏷️ Só um momento, estou preparando sua figurinha.",
            "🛠️ Tô tirando os créditos do criador original...",
            "✂️ Cortando o nome antigo e colocando o seu.",
            "🤏 Calma, tô roubando a figurinha pra você.",
            "🎨 Aplicando os metadados...",
            "🕵️ Trabalhando na arte, aguarde.",
            "⚡ Já vai ficar com a sua marca!",
            "📦 Desempacotando a figurinha...",
            "🧬 Alterando o DNA da figurinha.",
            "⏳ Um instante, a mágica tá rolando."
        ];

        let indice;
        do { indice = Math.floor(Math.random() * frasesEspera.length); } while (frasesEspera.length > 1 && indice === ultimaFrase);
        ultimaFrase = indice;

        await ctx.reply(frasesEspera[indice]);

        try {
            const mensagemParaBaixar = {
                key: ctx.message.key,
                message: { stickerMessage: figurinha }
            };

            const buffer = await downloadMediaMessage(
                mensagemParaBaixar,
                "buffer",
                {},
                { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
            );

            if (!buffer || buffer.length === 0) throw new Error("Figurinha vazia.");

            // CORREÇÃO: Autor vazio pra não duplicar o nome
            const figurinhaRenomeada = await aplicarMetadados(buffer, nome, "");

            if (!figurinhaRenomeada || figurinhaRenomeada.length === 0) {
                throw new Error("Figurinha renomeada vazia.");
            }

            await sendNYXMedia(ctx.sock, ctx.chat, { sticker: figurinhaRenomeada }, ctx.message);

        } catch (erro) {
            console.error("[TK/TAKE] Erro:", erro.message);
            await replyNYX(ctx, 
                `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ ❌ ▸ ɴãᴏ ᴄᴏɴsᴇɢᴜɪ ʀᴇɴᴏᴍᴇᴀʀ ᴇssᴀ ғɪɢᴜʀɪɴʜᴀ.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                "bot");
        }
    }
};