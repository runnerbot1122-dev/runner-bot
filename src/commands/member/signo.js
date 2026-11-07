const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["signo"],
    description: "Descobre o signo baseado na data",
    execute: async (ctx) => {
        const dataStr = ctx.args[0];
        if (!dataStr || !dataStr.includes("/")) {
            return replyNYX(ctx, `♈ *SIGNO*\n\nUso: ${ctx.prefix}signo DD/MM\nEx: ${ctx.prefix}signo 15/10`, "bot");
        }

        try { await ctx.react("♈"); } catch (e) {}

        const [diaStr, mesStr] = dataStr.split("/");
        const dia = parseInt(diaStr);
        const mes = parseInt(mesStr);

        if (isNaN(dia) || isNaN(mes) || dia < 1 || dia > 31 || mes < 1 || mes > 12) {
            return replyNYX(ctx, "❌ Data inválida. Use DD/MM.", "bot");
        }

        let signo = "";
        let emoji = "";
        let desc = "";

        if ((mes === 1 && dia >= 20) || (mes === 2 && dia <= 18)) { signo = "Aquário"; emoji = "♒"; desc = "Independente e original."; }
        else if ((mes === 2 && dia >= 19) || (mes === 3 && dia <= 20)) { signo = "Peixes"; emoji = "♓"; desc = "Sensível e sonhador."; }
        else if ((mes === 3 && dia >= 21) || (mes === 4 && dia <= 19)) { signo = "Áries"; emoji = "♈"; desc = "Corajoso e impulsivo."; }
        else if ((mes === 4 && dia >= 20) || (mes === 5 && dia <= 20)) { signo = "Touro"; emoji = "♉"; desc = "Teimoso e leal."; }
        else if ((mes === 5 && dia >= 21) || (mes === 6 && dia <= 20)) { signo = "Gêmeos"; emoji = "♊"; desc = "Comunicativo e curioso."; }
        else if ((mes === 6 && dia >= 21) || (mes === 7 && dia <= 22)) { signo = "Câncer"; emoji = "♋"; desc = "Protetor e emocional."; }
        else if ((mes === 7 && dia >= 23) || (mes === 8 && dia <= 22)) { signo = "Leão"; emoji = "♌"; desc = "Carismático e líder."; }
        else if ((mes === 8 && dia >= 23) || (mes === 9 && dia <= 22)) { signo = "Virgem"; emoji = "♍"; desc = "Detalhista e perfeccionista."; }
        else if ((mes === 9 && dia >= 23) || (mes === 10 && dia <= 22)) { signo = "Libra"; emoji = "♎"; desc = "Diplomático e justo."; }
        else if ((mes === 10 && dia >= 23) || (mes === 11 && dia <= 21)) { signo = "Escorpião"; emoji = "♏"; desc = "Intenso e misterioso."; }
        else if ((mes === 11 && dia >= 22) || (mes === 12 && dia <= 21)) { signo = "Sagitário"; emoji = "♐"; desc = "Aventureiro e otimista."; }
        else { signo = "Capricórnio"; emoji = "♑"; desc = "Focado e disciplinado."; }

        const texto = 
`╔═━✰『 sɪɢɴᴏ 』═━✰

║╎⊹ ࣪ ˖ 📅 ▸ ᴅᴀᴛᴀ: *${dataStr}*
║╎⊹ ࣪ ˖ ${emoji} ▸ sɪɢɴᴏ: *${signo}*
║╎⊹ ࣪ ˖ 💬 ▸ _${desc}_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, texto, "bot");
    }
};