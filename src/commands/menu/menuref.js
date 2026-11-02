const sendMenuReferencia =
    require("../../utils/sendMenuReferencia");


module.exports = {

    name: [
        "menuref"
    ],

    description:
        "Teste do menu referência",


    execute: async(ctx) => {

        await sendMenuReferencia(
            ctx,
            "principal.jpg"
        );

    }

};