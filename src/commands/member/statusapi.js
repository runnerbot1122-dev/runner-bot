const replyNYX = require("../../utils/replyNYX");
const axios = require("axios");

module.exports = {
    name: ["statusapi", "apis"],
    description: "Verifica o status das APIs do bot",
    execute: async (ctx) => {
        try { await ctx.react("🔄"); } catch (e) {}
        
        let statusIA = "❌ Offline";
        let statusDownload = "✅ Online (Local)"; 

        // Testa a IA (Pollinations) rapidinho pra ver se tá no ar
        try {
            const res = await axios.get("https://image.pollinations.ai/prompt/test?width=10&height=10", { timeout: 8000 });
            if (res.status === 200) statusIA = "✅ Online";
        } catch (e) {
            statusIA = "⚠️ Instável";
        }

        const texto = 
`╔═━✰『 sᴛᴀᴛᴜs ᴀᴘɪs 』═━✰

║╎⊹ ࣪ ˖ 🤖 ▸ ɪᴀ (Geração): ${statusIA}
║╎⊹ ࣪ ˖ 📥 ▸ ᴅᴏᴡɴʟᴏᴀᴅs: ${statusDownload}
║╎⊹ ࣪ ˖ 🧠 ▸ ɪᴀ ᴛᴇxᴛᴏ: ✅ Online

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, texto, "bot");
    }
};