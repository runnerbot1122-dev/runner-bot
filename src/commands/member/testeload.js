const replyNYX = require("../../utils/replyNYX");
module.exports = {
    name: ["testeload"],
    description: "Teste do reload",
    execute: async (ctx) => {
        await replyNYX(ctx, "✅ O RELOAD FUNCIONOU DE VERDADE!", "bot");
    }
};
