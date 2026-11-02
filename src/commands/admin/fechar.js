const {
    requireAdmin
} = require("../../utils/checkPermission");



module.exports = {


name:[
    "fechar",
    "f",
    "fgp",
    "fechargp"
],


description:
"Fecha o grupo",



execute: async(ctx)=>{


requireAdmin(ctx);



if(!ctx.isGroup){

    return ctx.reply(
        "❌ Apenas grupos."
    );

}



try{


await ctx.sock.groupSettingUpdate(

    ctx.chat,

    "announcement"

);



await ctx.replyNYX(

`ɢʀᴜᴘᴏ *ғᴇᴄʜᴀᴅᴏ* ᴄᴏᴍ sᴜᴄᴇssᴏ sᴇɴʜᴏʀ(ᴀ) 🙇‍♂️.`,

"user"

);



}
catch(e){


console.log(
    "Erro fechar:",
    e
);


await ctx.replyNYX(
    "❌ Não consegui fechar o grupo.",

"user"

);


}



}


};