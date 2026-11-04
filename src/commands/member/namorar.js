const fs = require("fs");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const familyDb = require("../../database/families");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["namorar", "casar"],
    description: "Envia um pedido de namoro para alguém",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;
        const alvo = getTarget(ctx);
        
        // 1. Erro: Sem alvo
        if (!alvo) {
            return replyNYX(ctx, 
                `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ ⚠️ ▸ ᴠᴏᴄê ᴘʀᴇᴄɪsᴀ ᴍᴀʀᴄᴀʀ ᴀʟɢᴜéᴍ ᴘᴀʀᴀ ɴᴀᴍᴏʀᴀʀ!\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                "user");
        }
        
        // 2. Erro: Si mesmo
        if (alvo === sender) {
            return replyNYX(ctx, 
                `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🪞 ▸ ᴠᴏᴄê ɴãᴏ ᴘᴏᴅᴇ ɴᴀᴍᴏʀᴀʀ ᴄᴏɴsɪɢᴏ ᴍᴇsᴍᴏ!\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                "user");
        }

        // Verifica se algum dos dois já tem família
        const familiaSender = familyDb.getFamilyOf(sender);
        const familiaAlvo = familyDb.getFamilyOf(alvo);

        // 3. Erro: Remetente já namora
        if (familiaSender) {
            const parceiro = familiaSender.casal.find(id => id !== sender) || "Alguém";
            return replyNYX(ctx, 
                { 
                    text: `╔═━✰『 ᴠᴏᴄê ᴊá ɴᴀᴍᴏʀᴀ 』═━✰\n\n║╎⊹ ࣪ ˖ 💔 ▸ ᴠᴏᴄê ɴãᴏ ᴘᴏᴅᴇ ᴘᴇᴅɪʀ ᴇᴍ ɴᴀᴍᴏʀᴏ ᴘᴏɪs ᴊá ᴇsᴛá ɴᴀᴍᴏʀᴀɴᴅᴏ ᴄᴏᴍ @${parceiro.split("@")[0]}.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                    mentions: [parceiro] 
                }, 
                "user");
        }

        // 4. Erro: Alvo já namora
        if (familiaAlvo) {
            const parceiroAlvo = familiaAlvo.casal.find(id => id !== alvo) || "Alguém";
            return replyNYX(ctx, 
                { 
                    text: `╔═━✰『 ᴘᴇssᴏᴀ ɪɴᴅɪsᴘᴏɴíᴠᴇʟ 』═━✰\n\n║╎⊹ ࣪ ˖ 🚫 ▸ ɴãᴏ sᴇʀá ᴘᴏssíᴠᴇʟ ᴘᴇᴅɪʀ ᴇssᴀ ᴘᴇssᴏᴀ ᴇᴍ ɴᴀᴍᴏʀᴏ, ᴘᴏɪs ᴀ ᴍᴇsᴍᴀ ᴊá ᴇsᴛá ᴄᴏᴍ @${parceiroAlvo.split("@")[0]}.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, 
                    mentions: [parceiroAlvo] 
                }, 
                "user");
        }

        try { await ctx.react("💍"); } catch (e) {}

        // Cria o pedido pendente
        familyDb.createProposal(sender, alvo);

        const texto = 
`╔═━✰『 🌸 ᴘᴇᴅɪᴅᴏ ᴅᴇ ɴᴀᴍᴏʀᴏ 🌸 』═━✰

║╎⊹ ࣪ ˖ 💌 ▸ ᴘᴇᴅɪᴅᴏ ᴘᴀʀᴀ: @${alvo.split("@")[0]}
║╎⊹ ࣪ ˖ 💖 ▸ ᴘᴇᴅɪᴅᴏ ᴘᴏʀ: @${sender.split("@")[0]}
║╎⊹ ࣪ ˖ ⏳ ▸ sᴛᴀᴛᴜs: *ᴀɢᴜᴀʀᴅᴀɴᴅᴏ ʀᴇsᴘᴏsᴛᴀ*

║╎⊹ ࣪ ˖ ✅ ▸ ʀᴇsᴘᴏɴᴅᴀ *sɪᴍ* ᴘᴀʀᴀ ᴀᴄᴇɪᴛᴀʀ
║╎⊹ ࣪ ˖ ❌ ▸ ʀᴇsᴘᴏɴᴅᴀ *ɴᴀ̃ᴏ* ᴘᴀʀᴀ ʀᴇᴄᴜsᴀʀ

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        // Caminho do GIF
        const gifPaths = [
            path.join(__dirname, "..", "..", "..", "assets", "gifs", "namorar.mp4"),
            path.join(__dirname, "..", "..", "..", "assets", "gifs", "pedido.mp4"),
            path.join(__dirname, "..", "..", "..", "assets", "gifs", "beijo.mp4")
        ];

        let gifBuffer = null;
        for (const p of gifPaths) {
            if (fs.existsSync(p)) {
                gifBuffer = fs.readFileSync(p);
                break;
            }
        }

        if (gifBuffer) {
            await sock.sendMessage(chat, {
                video: gifBuffer,
                gifPlayback: true,
                caption: texto,
                mentions: [sender, alvo]
            }, { quoted: message });
        } else {
            await replyNYX(ctx, { text: texto, mentions: [sender, alvo] }, "bot");
        }
    }
};