const {
    requireAdmin
} = require("../../utils/checkPermission");


const sendLinkGrupo =
    require("../../utils/sendLinkGrupo");



module.exports = {


name:[
    "link",
    "linkgrupo",
    "linkgp",
    "linkgroup"
],



execute: async(ctx)=>{


requireAdmin(ctx);


if(!ctx.isGroup){

return ctx.reply(
"❌ Apenas grupos."
);

}



const codigo =
    await ctx.sock.groupInviteCode(
        ctx.chat
    );


const link =
`https://chat.whatsapp.com/${codigo}`;



await sendLinkGrupo(
    ctx,
    link
);


}


};