const {
    requireOwner
} = require("../../utils/checkPermission");

module.exports = {


name:[
    "getgroupid",
    "idgrupo"
],


description:
"Mostra o ID do grupo",



execute: async(ctx)=>{

        requireOwner(ctx);


if(!ctx.isGroup){

    return ctx.reply(
        "❌ Esse comando só funciona em grupos."
    );

}



await ctx.replyNYX(

`${ctx.chat}`,

"bot"

);


}


};
