const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["encurtalink"],
    description: "Encurta um link",
    execute: async (ctx) => {
        const url = ctx.args.join(" ").trim();

        if (!/^https?:\/\/\S+$/i.test(url)) {
            return replyNYX(ctx, `🔗 *ENCURTAR LINK*\n\nUso: *${ctx.prefix}encurtalink https://exemplo.com*`, "bot");
        }

        try { await ctx.react("🔗"); } catch (e) {}

        try {
            const resposta = await axios.get("https://is.gd/create.php", {
                params: { format: "simple", url },
                timeout: 10000,
                responseType: "text"
            });

            const curto = String(resposta.data || "").trim();
            if (!/^https?:\/\/\S+$/i.test(curto)) {
                throw new Error(curto || "Resposta inválida do encurtador");
            }

            await replyNYX(ctx,
`╔═━✰『 ᴇɴᴄᴜʀᴛᴀʀ ʟɪɴᴋ 』═━✰

║╎⊹ ࣪ ˖ 🔗 ▸ ʟɪɴᴋ ᴇɴᴄᴜʀᴛᴀᴅᴏ:
${curto}

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
        } catch (error) {
            console.error("[ENCURTALINK] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui encurtar esse link. Tente novamente mais tarde.", "bot");
        }
    }
};
