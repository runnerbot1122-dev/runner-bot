const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["compatibilidade", "compativel"],
    description: "Calcula a compatibilidade entre duas pessoas",
    execute: async (ctx) => {
        const alvo = getTarget(ctx) || ctx.sender;
        const numSender = ctx.sender.split("@")[0];
        const numAlvo = alvo.split("@")[0];

        const porcentagem = Math.floor(Math.random() * 101);

        const preenchido = Math.round(porcentagem / 10);
        const barra = `${"█".repeat(preenchido)}${"░".repeat(10 - preenchido)} ${porcentagem}%`;

        let frase = "";
        if (porcentagem <= 20) frase = "Água e óleo. Não combinam em nada. 🛑";
        else if (porcentagem <= 50) frase = "Tem que ter paciência um com o outro. ⚖️";
        else if (porcentagem <= 80) frase = "Combinam bastante! Mesmos gostos. ✨";
        else frase = "Almas gêmeas! Um completa o outro. 🧩";

        try { await ctx.react("🧩"); } catch (e) {}

        const texto = 
`╔═━✰『 ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴅᴀᴅᴇ 』═━✰

║╎⊹ ࣪ ˖ 🧩 ▸ @${numSender} + @${numAlvo}
║╎⊹ ࣪ ˖ 📈 ▸ ɴíᴠᴇʟ: *${porcentagem}%*
║╎⊹ ࣪ ˖ 📊 ▸ ${barra}
║╎⊹ ࣪ ˖ 💬 ▸ _${fonteNYX(frase)}_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: [ctx.sender, alvo] }, "bot");
    }
};