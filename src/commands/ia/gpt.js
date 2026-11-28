const { executarConversa } = require("./conversa");

module.exports = {
    name: "gpt",
    description: "Conversa com um modelo rápido servido pela Groq",
    execute: (ctx) => executarConversa(ctx, "groq", "gpt")
};
