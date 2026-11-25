const replyNYX = require("../../utils/replyNYX");

function lerData(valor) {
    const match = String(valor || "").match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (!match) return null;

    const dia = Number(match[1]);
    const mes = Number(match[2]);
    const ano = Number(match[3]);
    const data = new Date(ano, mes - 1, dia);

    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
    ) return null;

    return data;
}

module.exports = {
    name: ["idade"],
    description: "Calcula a idade pela data de nascimento",
    execute: async (ctx) => {
        const nascimento = lerData(ctx.args[0]);
        const hoje = new Date();

        if (!nascimento || nascimento > hoje || nascimento.getFullYear() < 1900) {
            return replyNYX(ctx, `🎂 *CALCULADORA DE IDADE*\n\nUso: *${ctx.prefix}idade DD/MM/AAAA*\nExemplo: *${ctx.prefix}idade 10/05/2000*`, "bot");
        }

        let anos = hoje.getFullYear() - nascimento.getFullYear();
        let meses = hoje.getMonth() - nascimento.getMonth();
        let dias = hoje.getDate() - nascimento.getDate();

        if (dias < 0) {
            meses--;
            const ultimoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
            dias += ultimoMes;
        }
        if (meses < 0) {
            anos--;
            meses += 12;
        }

        try { await ctx.react("🎂"); } catch (e) {}

        await replyNYX(ctx,
`╔═━✰『 ᴄᴀʟᴄᴜʟᴀᴅᴏʀᴀ ᴅᴇ ɪᴅᴀᴅᴇ 』═━✰

║╎⊹ ࣪ ˖ 🎂 ▸ ɴᴀsᴄɪᴍᴇɴᴛᴏ: *${String(ctx.args[0]).replace(/-/g, "/")}*
║╎⊹ ࣪ ˖ 📅 ▸ ɪᴅᴀᴅᴇ: *${anos} anos, ${meses} meses e ${dias} dias*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
    }
};
