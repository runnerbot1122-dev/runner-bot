const { executarConversa } = require("./conversa");

module.exports = {
    name: ["gemini", "ia", "deepseek"],
    description: "Conversa com o Gemini e mantém compatibilidade com aliases antigos",
    execute: (ctx) => executarConversa(ctx, "gemini", "gemini")
};
