const {
    requireAdmin
} = require("../../utils/checkPermission");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");
const { getBotName } = require("../../utils/botNameStore");

function desembrulharMensagem(mensagem) {
    let atual = mensagem || {};
    for (let i = 0; i < 6; i++) {
        const interno = atual.ephemeralMessage?.message || atual.viewOnceMessage?.message ||
            atual.viewOnceMessageV2?.message || atual.viewOnceMessageV2Extension?.message ||
            atual.documentWithCaptionMessage?.message || atual.editedMessage?.message;
        if (!interno) break;
        atual = interno;
    }
    return atual;
}

function obterCitacao(mensagem) {
    const atual = desembrulharMensagem(mensagem?.message);
    for (const valor of Object.values(atual)) {
        const citada = valor?.contextInfo?.quotedMessage;
        if (citada) return desembrulharMensagem(citada);
    }
    return null;
}

function temFigurinha(mensagem) {
    const atual = desembrulharMensagem(mensagem);
    return Boolean(atual.stickerMessage || atual.audioStickerMessage?.message?.stickerMessage);
}

function ehMidiaDeFigurinha(mensagem) {
    const atual = desembrulharMensagem(mensagem);
    return Boolean(atual.imageMessage || atual.videoMessage || atual.audioMessage || temFigurinha(atual));
}

function isPedidoDeFigurinha(ctx) {
    return ehMidiaDeFigurinha(ctx.message?.message) || ehMidiaDeFigurinha(obterCitacao(ctx.message));
}

async function executarFigurinhaComSom(ctx) {
    const kit = await getSoundStickerKit();
    const resultado = await kit.figurinha(ctx.sock, ctx.message, {
        args: ctx.args.join(" ") || (ctx.sQuantity !== undefined && ctx.sQuantity !== 4 ? String(ctx.sQuantity) : ""),
        packname: getBotName(),
        author: ctx.message?.pushName || "",
        maxSeconds: 30
    });
    if (!resultado.ok) {
        return ctx.replyNYX(`❌ ${resultado.erro || "Não consegui criar a figurinha."}`, "bot");
    }
    return resultado;
}

const INTERVALO_MARCACOES = 500;
const ESPERA_RESTAURAR_NOME = 3000;

module.exports = {

    name: "s",

    description: "Marca o grupo e envia a enquete.",

    execute: async(ctx) => {

        try {
            if (isPedidoDeFigurinha(ctx)) {
                return await executarFigurinhaComSom(ctx);
            }
        } catch (erro) {
            console.error("[S-FIG] Erro:", erro.message);
            return ctx.replyNYX("❌ Não consegui iniciar a criação da figurinha.", "bot");
        }

        requireAdmin(ctx);

        if(!ctx.isGroup){
            return ctx.reply("❌ Apenas grupos.");
        }

        const quantidade =
            ctx.sQuantity === undefined
                ? 4
                : ctx.sQuantity;

        if(
            !Number.isInteger(quantidade) ||
            quantidade < 1 ||
            quantidade > 10
        ){
            return ctx.reply(
                "❌ Quantidade inválida. Use de 1 a 10 marcações."
            );
        }

        const metadata =
            await ctx.sock.groupMetadata(ctx.chat);

        const estadoOriginal =
            metadata?.announce;

        if(typeof estadoOriginal !== "boolean"){
            return ctx.reply(
                "❌ Não foi possível confirmar o estado original do grupo. A operação não foi iniciada."
            );
        }

        const nomeOriginal =
            metadata.subject;

        const membros =
            metadata.participants.map(
                membro => membro.id
            );

        try {

            await ctx.sock.groupUpdateSubject(
                ctx.chat,
                "ᴀᴅᴍ ᴘᴜxᴀɴᴅᴏ sᴀʟᴀ"
            );

            await ctx.sock.groupSettingUpdate(
                ctx.chat,
                "announcement"
            );

            await ctx.replyNYX(
                "ɢʀᴜᴘᴏ *ғᴇᴄʜᴀᴅᴏ* ᴘᴀʀᴀ ᴘᴜxᴀʀ sᴀʟᴀ 🚫",
                "bot"
            );

            for(
                let contador = 1;
                contador <= quantidade;
                contador++
            ){

                const texto =
`⸺͟͞ᴍᴀʀᴄᴀɴᴅᴏ ᴛᴏᴅᴏ ᴏ ɢʀᴜᴘᴏ

> *ʀᴏᴜʙᴀ* ʟɪsᴛᴀ ᴀɪ ᴘɴᴄ ᴋᴋᴋᴋᴋᴋᴋ
> 777x

*${contador}/${quantidade}*`;

                await ctx.replyNYX(
                    {
                        text: texto,
                        mentions: membros
                    },
                    "bot"
                );

                if(contador < quantidade){

                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                INTERVALO_MARCACOES
                            )
                    );

                }

            }

            await ctx.reply({
                poll: {
                    name: "⸺͟͞sᴀʟᴀ",

                    values: [
                        "✔ 𝗢𝗡𝗟𝗜𝗡𝗘",
                        "✖ 𝗢𝗙𝗙𝗟𝗜𝗡𝗘"
                    ],

                    selectableCount: 1
                }
            });

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        ESPERA_RESTAURAR_NOME
                    )
            );

        }
        finally {

            try {

                await ctx.sock.groupSettingUpdate(
                    ctx.chat,
                    estadoOriginal
                        ? "announcement"
                        : "not_announcement"
                );

            }
            finally {

                await ctx.sock.groupUpdateSubject(
                    ctx.chat,
                    nomeOriginal
                );

            }

        }

    }

};
