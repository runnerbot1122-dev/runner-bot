module.exports = {
    name: ["rankativos", "rankativo"],
    description: "Atalho para o ranking de XP",
    execute: async (ctx) => {
        const rank = require("./rank");
        return rank.execute(ctx);
    }
};