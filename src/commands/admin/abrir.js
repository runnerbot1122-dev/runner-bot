const {
    requireAdmin
} = require("../../utils/checkPermission");



module.exports = {


name:[
    "abrir",
    "a",
    "agp",
    "abrirgp"
],


description:
"Abre o grupo",



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

    "not_announcement"

);



await ctx.replyNYX(

`ɢʀᴜᴘᴏ *ᴀʙᴇʀᴛᴏ* ᴄᴏᴍ sᴜᴄᴇssᴏ sᴇɴʜᴏʀ(ᴀ) 🙇‍♂️.`,

"user"

);



}
catch(e){


console.log(
    "Erro abrir:",
    e
);


await ctx.replyNYX(

"❌ Não consegui abrir o grupo.",

"user"

);


}



}


};
