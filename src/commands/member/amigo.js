const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["amigo", "amizade", "melhoresamigos"],
    description: "Calcula a porcentagem de amizade entre duas pessoas",
    execute: async (ctx) => {
        const alvo = getTarget(ctx) || ctx.sender;
        const numSender = ctx.sender.split("@")[0];
        const numAlvo = alvo.split("@")[0];

        // Sorteia a amizade (evita dar 0 ou 100 pra ficar realista)
        const porcentagem = Math.floor(Math.random() * 81) + 20; 
        
        const preenchido = Math.round(porcentagem / 10);
        const barra = `${"█".repeat(preenchido)}${"░".repeat(10 - preenchido)} ${porcentagem}%`;

        let frase = "";
        if (porcentagem <= 30) frase = "Amizade? Vocês mal se cumprimentam na rua. 🥶";
        else if (porcentagem <= 60) frase = "Amigos de rolê, mas não se falam no privado. 🤝";
        else if (porcentagem <= 85) frase = "Amizade verdadeira! Tão sempre juntos. 👯";
        else frase = "Irmãos de consideração! Nem a morte separa. 💙";

        try { await ctx.react("🤝"); } catch (e) {}

        const texto = 
`╔═━✰『 ᴀᴍɪᴢᴀᴅᴇ 』═━✰

║╎⊹ ࣪ ˖ 🤝 ▸ @${numSender} + @${numAlvo}
║╎⊹ ࣪ ˖ 💙 ▸ ɴíᴠᴇʟ ᴅᴇ ᴀᴍɪᴢᴀᴅᴇ: *${porcentagem}%*
║╎⊹ ࣪ ˖ 📊 ▸ ${barra}
║╎⊹ ࣪ ˖ 💬 ▸ _${fonteNYX(frase)}_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: [ctx.sender, alvo] }, "bot");
    }
};