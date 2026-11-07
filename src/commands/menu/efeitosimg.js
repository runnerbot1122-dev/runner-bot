const sendMenu = require("../../utils/sendMenu");
const menuEfeitos = require("../../utils/menus/efeitos");

module.exports = {
    name: ["efeitosimg", "efeitos"],
    description: "Mostra o menu de efeitos de imagem",
    execute: async (ctx) => {
        await sendMenu(ctx, "efeitos.jpg", menuEfeitos(ctx.prefix)); // Coloque a imagem efeitos.jpg
    }
};