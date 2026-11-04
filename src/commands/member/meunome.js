const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const { getExistingUser } = require("../../utils/users");

module.exports = {
    name: ["meunome", "nome"],
    description: "Mostra o nome registrado de um usuário no bot",
    execute: async (ctx) => {
        // Pega quem foi marcado, ou usa quem mandou o comando
        const alvo = getTarget(ctx) || ctx.sender;
        
        // Busca os dados no banco (users.json)
        const user = getExistingUser([alvo]);
        const numero = alvo.split("@")[0];

        let nomeParaMostrar = "Desconhecido";

        if (user && user.name) {
            nomeParaMostrar = user.name;
        } else {
            // Se não achou no banco, tenta pegar do próprio WhatsApp
            nomeParaMostrar = ctx.message.pushName || "Sem registro";
        }

        try { await ctx.react("📝"); } catch (e) {}

        const texto = 
`╔═━✰『 ᴍᴇᴜ ɴᴏᴍᴇ 』═━✰

║╎⊹ ࣪ ˖ 👤 ▸ @${numero}
║╎⊹ ࣪ ˖ 📝 ▸ ɴᴏᴍᴇ ʀᴇɢɪsᴛʀᴀᴅᴏ: *${nomeParaMostrar}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: [alvo] }, "bot");
    }
};