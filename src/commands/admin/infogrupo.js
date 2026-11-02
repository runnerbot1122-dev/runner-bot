const { getBotName } = require("../../utils/botNameStore");
const fonteNYX = require("../../utils/fonteNYX");
const { requireAdmin } = require("../../utils/checkPermission");

module.exports = {
    name: ["infogrupo", "grupo", "grupoinfo", "infogp"],
    description: "Informações do grupo",

    execute: async (ctx) => {
        requireAdmin(ctx);

        if (!ctx.isGroup) {
            return ctx.reply("❌ Apenas grupos.");
        }

        let metadata;

        try {
            metadata = await ctx.sock.groupMetadata(ctx.chat);
        } catch (e) {
            console.log("Erro obtendo informações do grupo:", e.message);
            return ctx.reply("❌ Não consegui obter as informações desse grupo.");
        }

        const admins = metadata.participants.filter(
            membro => membro.admin
        ).length;

        const criador = metadata.owner || "Não informado";
        const nomeGrupo = metadata.subject || "Sem nome";
        const membros = metadata.participants.length;
        const descricao = metadata.desc || "Sem descrição";

        const texto = `
╔═━✰『 💸 ${fonteNYX("INFO GRUPO")} 』━═╗

╠═✰『 ɪᴅᴇɴᴛɪғɪᴄᴀᴄ̧ᴀ̃ᴏ 』
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("NOME")}: ${nomeGrupo}
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("MEMBROS")}: ${membros}
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("ADMINS")}: ${admins}

╠═✰『 ᴅᴇᴛᴀʟʜᴇs 』
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("ID")}: ${ctx.chat}
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("CRIADOR")}: ${criador}

╠═✰『 ᴅᴇsᴄʀɪᴄ̧ᴀ̃ᴏ 』
${descricao}

╚═━═━═━═━ ${fonteNYX(getBotName())} ━═━═━═━✰
`;

        await ctx.replyNYX(
            {
                image: { url: "./assets/infogrupo.jpg" },
                caption: texto
            },
            "user"
        );
    }
};
