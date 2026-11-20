const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["tabela"],
    description: "Gera a tabuada de um número",

    execute: async ctx => {
        const numero = Number(ctx.args[0]);
        if (!Number.isFinite(numero) || !Number.isInteger(numero) || numero < -1000 || numero > 1000) {
            return replyNYX(ctx, `✖️ Informe um número inteiro entre -1000 e 1000.\n\nUso: ${ctx.prefix}tabela 7`, "bot");
        }

        const linhas = Array.from({ length: 10 }, (_, i) => `${numero} × ${i + 1} = ${numero * (i + 1)}`);
        return replyNYX(ctx, `📊 *TABUADA DO ${numero}*\n\n${linhas.join("\n")}`, "bot");
    }
};