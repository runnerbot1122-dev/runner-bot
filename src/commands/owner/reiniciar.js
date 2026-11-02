const config =
    require("../../config/config");


module.exports = {


name:[
    "reiniciar",
    "restart",
    "r"
],


description:
"Reinicia o bot",



execute: async(ctx)=>{


if(!ctx.isOwner){

    return ctx.reply(
        "❌ Apenas o dono pode usar este comando."
    );

}



await ctx.replyNYX(

"🔄 𝖱𝖾𝗂𝗇𝗂𝖼𝗂𝖺𝗇𝖽𝗈... 𝖺𝗍𝖾́ 𝗅𝗈𝗀𝗈, 𝗉𝖺𝗉𝖺𝗂.",

"bot"

);



setTimeout(()=>{


    const {
        reiniciarBot
    } =
    require("../../core/manager");


    reiniciarBot(
        config.sessionName
    );


},2000);



}


};