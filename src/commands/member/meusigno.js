const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const { getExistingUser } = require("../../utils/users");

module.exports = {
    name: ["meusigno", "signo"],
    description: "Descobre o signo do usuário baseado no registro",
    execute: async (ctx) => {
        const alvo = getTarget(ctx) || ctx.sender;
        const user = getExistingUser([alvo]);
        const numero = alvo.split("@")[0];

        if (!user || !user.createdAt) {
            return replyNYX(ctx, "❌ Este usuário ainda não tem registro.", "user");
        }

        const data = new Date(user.createdAt);
        const dia = data.getDate();
        const mes = data.getMonth() + 1; // Janeiro é 0

        let signo = "";
        if ((mes === 1 && dia >= 20) || (mes === 2 && dia <= 18)) signo = "Aquário ♒";
        else if ((mes === 2 && dia >= 19) || (mes === 3 && dia <= 20)) signo = "Peixes ♓";
        else if ((mes === 3 && dia >= 21) || (mes === 4 && dia <= 19)) signo = "Áries ♈";
        else if ((mes === 4 && dia >= 20) || (mes === 5 && dia <= 20)) signo = "Touro ♉";
        else if ((mes === 5 && dia >= 21) || (mes === 6 && dia <= 20)) signo = "Gêmeos ♊";
        else if ((mes === 6 && dia >= 21) || (mes === 7 && dia <= 22)) signo = "Câncer ♋";
        else if ((mes === 7 && dia >= 23) || (mes === 8 && dia <= 22)) signo = "Leão ♌";
        else if ((mes === 8 && dia >= 23) || (mes === 9 && dia <= 22)) signo = "Virgem ♍";
        else if ((mes === 9 && dia >= 23) || (mes === 10 && dia <= 22)) signo = "Libra ♎";
        else if ((mes === 10 && dia >= 23) || (mes === 11 && dia <= 21)) signo = "Escorpião ♏";
        else if ((mes === 11 && dia >= 22) || (mes === 12 && dia <= 21)) signo = "Sagitário ♐";
        else signo = "Capricórnio ♑";

        try { await ctx.react("🔮"); } catch (e) {}

        const texto = 
`╔═━✰『 ᴍᴇᴜ sɪɢɴᴏ 』═━✰

║╎⊹ ࣪ ˖ 👤 ▸ @${numero}
║╎⊹ ࣪ ˖ 🔮 ▸ sɪɢɴᴏ: *${signo}*
║╎⊹ ࣪ ˖ ✨ ▸ _Baseado no registro do bot_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: [alvo] }, "bot");
    }
};