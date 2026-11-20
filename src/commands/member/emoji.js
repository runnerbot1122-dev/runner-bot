const replyNYX = require("../../utils/replyNYX");

const categorias = {
    amor: ["❤️", "💕", "💖", "💘", "🥰", "😍"],
    feliz: ["😀", "😄", "😁", "😆", "🥳", "🤩"],
    triste: ["😔", "😢", "😭", "🥺", "💔", "😞"],
    risada: ["😂", "🤣", "😹", "笑", "😆", "🤭"],
    fogo: ["🔥", "💥", "⚡", "✨", "🌟", "🚀"],
    animais: ["🐶", "🐱", "🦊", "🐼", "🐸", "🦁"]
};

module.exports = {
    name: ["emoji"],
    description: "Sugere emojis por categoria",

    execute: async ctx => {
        const categoria = ctx.args.join(" ").trim().toLowerCase() || "feliz";
        const emojis = categorias[categoria] || Object.values(categorias).flat();
        const selecionados = [...emojis].sort(() => Math.random() - 0.5).slice(0, 5).join(" ");
        const aviso = categorias[categoria] ? `Categoria: *${categoria}*` : "Categoria não encontrada; emojis aleatórios:";
        return replyNYX(ctx, `😀 *EMOJIS*\n\n${aviso}\n\n${selecionados}\n\nCategorias: amor, feliz, triste, risada, fogo, animais`, "bot");
    }
};
