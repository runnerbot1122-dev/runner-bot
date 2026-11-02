const sendMenu =
require("../../utils/sendMenu");


const menuBrincadeiras =
require("../../utils/menus/brincadeiras");


module.exports = {


name:[
"menubrincadeiras"
],


description:
"Menu brincadeiras",



execute: async(ctx)=>{


await sendMenu(
ctx,
"brincadeiras.jpg",
menuBrincadeiras(ctx.prefix)
);


}


};