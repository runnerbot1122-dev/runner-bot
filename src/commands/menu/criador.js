const sendMenu = require("../../utils/sendMenu");
const menuCriador = require("../../utils/menus/criador");

module.exports = {
    name: ["criador", "dev", "suporte"],
    description: "Mostra o contato do criador",

    execute: async (ctx) => {
        // Envia o card com a imagem criador.jpg e o texto formatado
        await sendMenu(
            ctx,
            "criador.jpg",
            menuCriador(ctx.prefix)
        );
    }
};