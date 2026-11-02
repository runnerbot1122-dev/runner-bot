const sendMenuPrincipal =
    require("../../utils/sendMenuReferencia.funcionando");


module.exports = {

    name: [
        "menu",
        "help"
    ],

    description:
        "Menu principal do bot",


    execute: async(ctx) => {

        await sendMenuPrincipal(
            ctx,
            "principal.jpg"
        );

    }

};
