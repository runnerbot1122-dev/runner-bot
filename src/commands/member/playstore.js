const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["playstore", "app"],
    description: "Busca um aplicativo na Play Store",
    execute: async (ctx) => {
        const busca = ctx.args.join(" ").trim();
        if (!busca) return replyNYX(ctx, `📱 *PLAY STORE*\n\nUso: ${ctx.prefix}playstore [nome do app]`, "bot");

        try { await ctx.react("📱"); } catch (e) {}

        try {
            // Correção: Puxa o módulo e verifica se a função está no .default (ESM) ou na raiz (CJS)
            let gplay = require("google-play-scraper");
            if (!gplay.search) {
                gplay = gplay.default || gplay;
            }
            
            const resultados = await gplay.search({ term: busca, num: 1 });
            
            if (!resultados || resultados.length === 0) {
                return replyNYX(ctx, "❌ App não encontrado.", "bot");
            }

            const app = await gplay.app({ appId: resultados[0].appId });

            const texto = 
`╔═━✰『 ᴘʟᴀʏ sᴛᴏʀᴇ 』═━✰

║╎⊹ ࣪ ˖ 📱 ▸ *${app.title}*
║╎⊹ ࣪ ˖ 🏢 ▸ ᴅᴇsᴇɴᴠᴏʟᴠᴇᴅᴏʀ: *${app.developer}*
║╎⊹ ࣪ ˖ ⭐ ▸ ɴᴏᴛᴀ: *${app.scoreText}*
║╎⊹ ࣪ ˖ 📥 ▸ ɪɴsᴛᴀʟᴀçõᴇs: *${app.installs}*
║╎⊹ ࣪ ˖ 🔗 ▸ ʟɪɴᴋ:
${app.url}

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");
        } catch (e) {
            console.error("[PLAYSTORE] Erro detalhado:", e.message);
            await replyNYX(ctx, "❌ Erro ao buscar o aplicativo.", "bot");
        }
    }
};