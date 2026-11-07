module.exports = {
    name: ["atividade"],
    description: "Atalho para o perfil de atividade",
    execute: async (ctx) => {
        const check = require("./checkativo");
        return check.execute(ctx);
    }
};