const sendMenuTeste =
    require("../../utils/sendMenuTeste");


module.exports = {

    name: [
        "menuteste"
    ],

    description:
        "Teste do menu Native Flow single_select",


    execute: async(ctx) => {

        await sendMenuTeste(
            ctx,
            "principal.jpg"
        );

    }

};