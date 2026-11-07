const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["clima", "tempo"],
    description: "Mostra a previsão do tempo de uma cidade",
    execute: async (ctx) => {
        const cidade = ctx.args.join(" ").trim();
        if (!cidade) {
            return replyNYX(ctx, `🌤️ *CLIMA*\n\nUso: ${ctx.prefix}clima [cidade]\nEx: ${ctx.prefix}clima São Paulo`, "bot");
        }

        try { await ctx.react("🌤️"); } catch (e) {}

        try {
            const res = await axios.get(`https://wttr.in/${encodeURIComponent(cidade)}?format=j1`, { timeout: 10000 });
            const data = res.data;
            
            if (!data.current_condition || !data.current_condition[0]) throw new Error("Cidade não encontrada");

            const atual = data.current_condition[0];
            const previsao = data.weather[0];
            const desc = atual.weatherDesc[0].value;
            const temp = atual.temp_C;
            const sensacao = atual.FeelsLikeC;
            const umidade = atual.humidity;
            const vento = atual.windspeedKmph;
            const max = previsao.maxtempC;
            const min = previsao.mintempC;

            const texto = 
`╔═━✰『 ᴄʟɪᴍᴀ ᴀɢᴏʀᴀ 』═━✰

║╎⊹ ࣪ ˖ 📍 ▸ *${cidade.toUpperCase()}*
║╎⊹ ࣪ ˖ 🌡️ ▸ ᴛᴇᴍᴘ: *${temp}°C* (sᴇɴsᴀçãᴏ: ${sensacao}°C)
║╎⊹ ࣪ ˖ ☁️ ▸ ᴄᴏɴᴅɪçãᴏ: *${desc}*
║╎⊹ ࣪ ˖ 💧 ▸ ᴜᴍɪᴅᴀᴅᴇ: *${umidade}%*
║╎⊹ ࣪ ˖ 💨 ▸ ᴠᴇɴᴛᴏ: *${vento} km/h*
║╎⊹ ࣪ ˖ 📊 ▸ ᴍáx: *${max}°C* / ᴍíɴ: *${min}°C*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");

        } catch (error) {
            console.error("[CLIMA] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui buscar o clima para essa cidade.", "bot");
        }
    }
};