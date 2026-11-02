const sendMenu =
require("../../utils/sendMenu");


const menuIA =
require("../../utils/menus/ia");


module.exports = {


name:[
"menuia"
],


description:
"Menu inteligência artificial",



execute: async(ctx)=>{


await sendMenu(
ctx,
"ia.jpg",
menuIA(ctx.prefix)
);


}


};