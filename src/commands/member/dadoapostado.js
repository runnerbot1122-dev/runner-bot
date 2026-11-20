const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["dadoapostado"],
    description: "Aposta no resultado de um dado",

    execute: async ctx => {
        const aposta = Number(ctx.args[0]);
        if (!Number.isInteger(aposta) || aposta < 1 || aposta > 6) {
            return replyNYX(ctx, `🎲 Escolha um número de 1 a 6.\n\nUso: ${ctx.prefix}dadoapostado 4`, "bot");
        }

        const resultado = Math.floor(Math.random() * 6) + 1;
        const acertou = aposta === resultado;
        return replyNYX(ctx, `🎲 O dado caiu em *${resultado}*.\n\n${acertou ? "🎉 Você acertou!" : `❌ Você apostou em *${aposta}* e errou.`}`, "bot");
    }
};
