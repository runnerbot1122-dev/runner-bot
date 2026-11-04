const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const { getExistingUser } = require("../../utils/users");

module.exports = {
    name: ["contardias", "dias"],
    description: "Mostra quantos dias o usuário tem registrado no bot",
    execute: async (ctx) => {
        const alvo = getTarget(ctx) || ctx.sender;
        const user = getExistingUser([alvo]);
        const numero = alvo.split("@")[0];

        if (!user || !user.createdAt) {
            return replyNYX(ctx, "❌ Este usuário ainda não tem registro no bot.", "user");
        }

        const dataCriacao = new Date(user.createdAt);
        const hoje = new Date();
        const diferencaMs = hoje - dataCriacao;
        const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

        try { await ctx.react("📅"); } catch (e) {}

        const texto = 
`╔═━✰『 ᴄᴏɴᴛᴀʀ ᴅɪᴀs 』═━✰

║╎⊹ ࣪ ˖ 👤 ▸ @${numero}
║╎⊹ ࣪ ˖ 📅 ▸ ʀᴇɢɪsᴛʀᴀᴅᴏ ʜá: *${dias} dias*
║╎⊹ ࣪ ˖ 🕒 ▸ ᴅᴇsᴅᴇ: *${dataCriacao.toLocaleDateString("pt-BR")}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: [alvo] }, "bot");
    }
};