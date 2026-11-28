const replyNYX = require("../../utils/replyNYX");
const { getBotName } = require("../../utils/botNameStore");

module.exports = {
    name: ["infobot"],
    description: "Mostra informações técnicas do bot",
    execute: async (ctx) => {
        const uptime = process.uptime();
        const horas = Math.floor(uptime / 3600);
        const minutos = Math.floor((uptime % 3600) / 60);
        const memoria = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

        const texto = 
`╔═━✰『 ɪɴғᴏ ʙᴏᴛ 』═━✰

║╎⊹ ࣪ ˖ 🤖 ▸ ɴᴏᴍᴇ: *${getBotName()}*
║╎⊹ ࣪ ˖ 📡 ▸ ᴘʟᴀᴛᴀғᴏʀᴍᴀ: *Node.js ${process.version}*
║╎⊹ ࣪ ˖ ⏱️ ▸ ᴏɴʟɪɴᴇ ʜá: *${horas}h ${minutos}m*
║╎⊹ ࣪ ˖ 💾 ▸ ᴍᴇᴍóʀɪᴀ: *${memoria} MB*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, texto, "bot");
    }
};
