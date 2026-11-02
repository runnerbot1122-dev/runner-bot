const {
    requireAdmin
} = require("../../utils/checkPermission");

const INTERVALO_MARCACOES = 500;
const ESPERA_RESTAURAR_NOME = 1000;

module.exports = {

    name: "x",

    description: "Marca o grupo e envia a enquete XGRUPO.",

    execute: async(ctx) => {

        requireAdmin(ctx);

        if(!ctx.isGroup){
            return ctx.reply("❌ Apenas grupos.");
        }

        const quantidade =
            ctx.xQuantity === undefined
                ? 4
                : ctx.xQuantity;

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
                "ᴀᴅᴍ ᴘᴜxᴀɴᴅᴏ xɢʀᴜᴘᴏ"
            );

            await ctx.sock.groupSettingUpdate(
                ctx.chat,
                "announcement"
            );

            await ctx.replyNYX(
                "ɢʀᴜᴘᴏ *ғᴇᴄʜᴀᴅᴏ* ᴘᴀʀᴀ ᴘᴜxᴀʀ xɢʀᴜᴘᴏ 🚫",
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
                    name: "⸺͟͞xɢʀᴜᴘᴏ",

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
