const {
    requireAdmin
} = require("../../utils/checkPermission");

const {
    addAutoReply
} = require("../../utils/groups");


module.exports = {

    name: "addr",

    description: "Cadastra uma resposta automática por palavra ou frase",

    execute: async (ctx) => {

        requireAdmin(ctx);


        if(!ctx.isGroup){

            return ctx.reply(
                "❌ Apenas grupos."
            );

        }


        const raw =
            ctx.args.join(" ")
                .trim();


        if(!raw || !raw.includes("|")){

            return ctx.replyNYX(

`⚙️ Uso:

7addr <gatilho> | <resposta>

Exemplo:
7addr bom dia | Bom dia, família! ☀️`,

                "bot"

            );

        }


        const separador =
            raw.indexOf("|");

        const trigger =
            raw.slice(0, separador)
                .trim();

        const response =
            raw.slice(separador + 1)
                .trim();


        if(!trigger || !response){

            return ctx.replyNYX(

`⚙️ Uso:

7addr <gatilho> | <resposta>`,

                "bot"

            );

        }


        addAutoReply(
            ctx.chat,
            trigger,
            response
        );


        return ctx.replyNYX(

`✅ Resposta automática cadastrada.

${trigger} → ${response}`,

            "bot"

        );

    }

};
