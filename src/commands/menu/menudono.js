const sendMenu =
    require("../../utils/sendMenu");


const menuDono =
    require("../../utils/menus/dono");


module.exports = {


    name: [
        "menudono"
    ],


    description:
        "Menu do dono",


    execute: async(ctx) => {


        // =====================================================
        // SOMENTE O DONO PODE ACESSAR
        // =====================================================

        if (!ctx.isOwner) {

            return ctx.reply(
                "❌ Este menu é exclusivo para o dono do bot."
            );

        }


        // =====================================================
        // ENVIA MENU DO DONO
        // =====================================================

        await sendMenu(
            ctx,
            "dono.jpg",
            menuDono(ctx.prefix)
        );


    }


};