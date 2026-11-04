const replyNYX = require("../../utils/replyNYX");
const familyDb = require("../../database/families");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["familia", "minhafamilia"],
    description: "Mostra a árvore genealógica da sua família",
    execute: async (ctx) => {
        const familia = familyDb.getFamilyOf(ctx.sender);

        if (!familia) {
            return replyNYX(ctx, 
                `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🚫 ▸ ᴠᴏᴄê ɴãᴏ ғᴀᴢ ᴘᴀʀᴛᴇ ᴅᴇ ɴᴇɴʜᴜᴍᴀ ғᴀᴍíʟɪᴀ.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                "user");
        }

        // Identifica o papel do usuário (pai/mãe ou filho)
        const isCasal = familia.casal.includes(ctx.sender);
        const p1 = familia.casal[0];
        const p2 = familia.casal[1];
        
        // Define quem é o Pai e quem é a Mãe (brincadeira, só pra separar)
        const pai = p1; 
        const mae = p2;

        let textoFilhos = "Nenhum";
        let mentions = [...familia.casal];

        if (familia.filhos.length > 0) {
            textoFilhos = familia.filhos.map(f => `@${f.split("@")[0]}`).join(" / ");
            mentions.push(...familia.filhos);
        }

        const historiaFormatada = fonteNYX(familia.historia);

        const texto = 
`╔═━✰『 👨‍👩‍👧 ғᴀᴍíʟɪᴀ 』═━✰

║╎⊹ ࣪ ˖ 🆔 ▸ ɪᴅ: *${familia.id}*
║╎⊹ ࣪ ˖ 💍 ▸ ᴄᴀsᴀʟ: @${pai.split("@")[0]} 💖 @${mae.split("@")[0]}
║╎⊹ ࣪ ˖ 👶 ▸ ғɪʟʜᴏs (${familia.filhos.length}): ${textoFilhos}
║╎⊹ ࣪ ˖ 📅 ▸ ᴄʀɪᴀᴄ̧ãᴏ: *${familia.dataCriacao}*

║╎⊹ ࣪ ˖ 📖 ▸ ʜɪsᴛóʀɪᴀ ᴅᴏ ᴄᴀsᴀʟ:
║╎⊹ ࣪ ˖ _${historiaFormatada}_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions }, "bot");
    }
};