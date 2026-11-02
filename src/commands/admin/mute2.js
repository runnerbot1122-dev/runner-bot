const { requireAdmin } = require("../../utils/checkPermission");
const { getTarget } = require("../../utils/checkTarget");
const { mutar } = require("../../utils/mutes");

module.exports = {
    name: ["mute2"],
    description: "Muta um usuário por um tempo específico (ex: 10m, 1h)",
    execute: async (ctx) => {
        requireAdmin(ctx);
        const alvo = getTarget(ctx);
        const tempoStr = ctx.args[1]?.toLowerCase(); // Pega o tempo (ex: 10m)
        
        if (!alvo || !tempoStr) return ctx.reply("❌ Uso: 7mute2 @user 10m");

        const match = tempoStr.match(/^(\d+)([mh])$/);
        if (!match) return ctx.reply("❌ Formato de tempo inválido. Use 10m ou 1h.");

        const valor = parseInt(match[1]);
        const unidade = match[2] === "m" ? 60000 : 3600000;
        const duracaoMs = valor * unidade;

        mutar(ctx.chat, alvo);
        await ctx.replyNYX(`🔇 @${alvo.split("@")[0]} foi mutado por ${tempoStr}.`, "user");

        // Desmuta automaticamente após o tempo
        setTimeout(async () => {
            try {
                const { desmutar } = require("../../utils/mutes");
                desmutar(ctx.chat, alvo);
                await ctx.sock.sendMessage(ctx.chat, { text: `🔊 @${alvo.split("@")[0]} o tempo de mute acabou.`, mentions: [alvo] });
            } catch (_) {}
        }, duracaoMs);
    }
};