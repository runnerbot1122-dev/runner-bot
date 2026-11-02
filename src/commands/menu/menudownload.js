const sendMenu =
require("../../utils/sendMenu");


const menuDownloads =
require("../../utils/menus/downloads");


module.exports = {


name:[
"menudownload"
],


description:
"Menu downloads",



execute: async(ctx)=>{


await sendMenu(
ctx,
"downloads.jpg",
menuDownloads(ctx.prefix)
);


}


};