const sendMenu = require("../../utils/sendMenu");
const menuStaff = require("../../utils/menus/staff");

module.exports = {
    name: ["menustaff", "staffmenu"],
    description: "Mostra o menu de Staff",
    execute: async (ctx) => {
        await sendMenu(ctx, "staff.jpg", menuStaff(ctx.prefix)); // Coloque a imagem staff.jpg
    }
};