const sendMenu = require("../../utils/sendMenu");
const menuPrincipal = require("../../utils/menus/principal");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: ["menuprincipal"],
    description: "Mostra o menu com todos os comandos",

    execute: async (ctx) => {
        // (Opcional) Toca o áudio do menu, igual os outros
        const audioPath = path.join(process.cwd(), "assets", "menus", "audio-menu.ogg");
        if (fs.existsSync(audioPath)) {
            try { 
                await ctx.sock.sendMessage(ctx.chat, { 
                    audio: fs.readFileSync(audioPath), 
                    mimetype: "audio/ogg; codecs=opus", 
                    ptt: false 
                }); 
            }
            catch (error) { console.error("Falha ao reproduzir áudio:", error.message); }
        }
        
        // Envia o card com a imagem "principal.jpg" e o texto gerado
        await sendMenu(
            ctx,
            "principal.jpg",
            menuPrincipal(ctx.prefix)
        );
    }
};