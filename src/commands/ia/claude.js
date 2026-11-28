const { executarConversa } = require("./conversa");

module.exports = {
    name: ["claude", "cloude"],
    description: "Conversa com Claude",
    execute: (ctx) => executarConversa(ctx, "claude", "claude")
};
