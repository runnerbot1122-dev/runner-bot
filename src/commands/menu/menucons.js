const sendMenu = require("../../utils/sendMenu");
const menuCons = require("../../utils/menus/cons");

module.exports = {
    name: ["menucons", "consmenu"],
    description: "Mostra o menu de consultas",
    execute: async (ctx) => {
        await sendMenu(ctx, "cons.jpg", menuCons(ctx.prefix)); // Coloque a imagem cons.jpg
    }
};