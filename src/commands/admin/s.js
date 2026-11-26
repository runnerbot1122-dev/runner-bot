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
        return ctx.replyNYX(`â ${resultado.erro || "NÃ£o consegui criar a figurinha."}`, "bot");
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
            return ctx.replyNYX("â NÃ£o consegui iniciar a criaÃ§Ã£o da figurinha.", "bot");
        }

        requireAdmin(ctx);

        if(!ctx.isGroup){
            return ctx.reply("â Apenas grupos.");
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
                "â Quantidade invÃ¡lida. Use de 1 a 10 marcaÃ§Ãµes."
            );
        }

        const metadata =
            await ctx.sock.groupMetadata(ctx.chat);

        const estadoOriginal =
            metadata?.announce;

        if(typeof estadoOriginal !== "boolean"){
            return ctx.reply(
                "â NÃ£o foi possÃ­vel confirmar o estado original do grupo. A operaÃ§Ã£o nÃ£o foi iniciada."
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
                "á´á´á´ á´á´xá´É´á´á´ sá´Êá´"
            );

            await ctx.sock.groupSettingUpdate(
                ctx.chat,
                "announcement"
            );

            await ctx.replyNYX(
                "É¢Êá´á´á´ *Òá´á´Êá´á´á´* á´á´Êá´ á´á´xá´Ê sá´Êá´ ð«",
                "bot"
            );

            for(
                let contador = 1;
                contador <= quantidade;
                contador++
            ){

                const texto =
`â¸ºÍÍá´á´Êá´á´É´á´á´ á´á´á´á´ á´ É¢Êá´á´á´

> *Êá´á´Êá´* ÊÉªsá´á´ á´Éª á´É´á´ á´á´á´á´á´á´á´
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
                    name: "â¸ºÍÍsá´Êá´",

                    values: [
                        "â ð¢ð¡ððð¡ð",
                        "â ð¢ððððð¡ð"
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
