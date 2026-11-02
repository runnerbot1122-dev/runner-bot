const sendMenu = require("../../utils/sendMenu");
const menuAdmin = require("../../utils/menus/admin");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: ["menuadm"],
    description: "Menu administrativo",

    execute: async (ctx) => {
        const audioPath = path.join(process.cwd(), "assets", "menus", "audio-menu.ogg");
        if (fs.existsSync(audioPath)) {
            try { await ctx.sock.sendMessage(ctx.chat, { audio: fs.readFileSync(audioPath), mimetype: "audio/ogg; codecs=opus", ptt: false }); }
            catch (error) { console.error("Falha ao reproduzir áudio do menu:", error.message); }
        }
        await sendMenu(
            ctx,
            "admin.jpg",
            menuAdmin(ctx.prefix)
        );
    }
};
