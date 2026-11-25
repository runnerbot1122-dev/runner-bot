const replyNYX = require("../../utils/replyNYX");

function numero(valor) {
    return Number(String(valor || "").replace(",", "."));
}

module.exports = {
    name: ["obesidade"],
    description: "Calcula o índice de massa corporal",
    execute: async (ctx) => {
        const peso = numero(ctx.args[0]);
        let altura = numero(ctx.args[1]);

        if (altura > 3) altura /= 100;

        if (!Number.isFinite(peso) || !Number.isFinite(altura) || peso <= 0 || altura <= 0 || altura > 3) {
            return replyNYX(ctx, `⚖️ *CALCULADORA DE IMC*\n\nUso: *${ctx.prefix}obesidade <peso em kg> <altura em metros>*\nExemplo: *${ctx.prefix}obesidade 80 1,75*`, "bot");
        }

        const imc = peso / (altura * altura);
        let classificacao;

        if (imc < 18.5) classificacao = "Abaixo do peso";
        else if (imc < 25) classificacao = "Peso normal";
        else if (imc < 30) classificacao = "Sobrepeso";
        else if (imc < 35) classificacao = "Obesidade grau I";
        else if (imc < 40) classificacao = "Obesidade grau II";
        else classificacao = "Obesidade grau III";

        try { await ctx.react("⚖️"); } catch (e) {}

        await replyNYX(ctx,
`╔═━✰『 ᴄᴀʟᴄᴜʟᴀᴅᴏʀᴀ ᴅᴇ ɪᴍᴄ 』═━✰

║╎⊹ ࣪ ˖ ⚖️ ▸ ᴘᴇsᴏ: *${peso.toFixed(1)} kg*
║╎⊹ ࣪ ˖ 📏 ▸ ᴀʟᴛᴜʀᴀ: *${altura.toFixed(2)} m*
║╎⊹ ࣪ ˖ 📊 ▸ ɪᴍᴄ: *${imc.toFixed(2)}*
║╎⊹ ࣪ ˖ 📌 ▸ ᴄʟᴀssɪғɪᴄᴀçãᴏ: *${classificacao}*

> Resultado informativo. Não substitui avaliação de um profissional de saúde.

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
    }
};
