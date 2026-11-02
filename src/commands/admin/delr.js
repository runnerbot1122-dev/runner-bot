const {
    requireAdmin
} = require("../../utils/checkPermission");

const {
    removeAutoReply
} = require("../../utils/groups");


module.exports = {

    name: "delr",

    description: "Remove uma resposta automática por palavra ou frase",

    execute: async (ctx) => {

        requireAdmin(ctx);


        if(!ctx.isGroup){

            return ctx.reply(
                "❌ Apenas grupos."
            );

        }


        const trigger =
            ctx.args.join(" ")
                .trim();


        if(!trigger){

            return ctx.replyNYX(

`⚙️ Uso:

7delr <gatilho>

Exemplo:
7delr bom dia`,

                "bot"

            );

        }


        const removido =
            removeAutoReply(
                ctx.chat,
                trigger
            );


        if(!removido){

            return ctx.replyNYX(

`❌ Resposta automática não encontrada:

${trigger}`,

                "bot"

            );

        }


        return ctx.replyNYX(

`✅ Resposta automática removida:

${trigger}`,

            "bot"

        );

    }

};
