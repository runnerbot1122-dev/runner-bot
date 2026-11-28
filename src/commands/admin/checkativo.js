const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");
const { getExistingUser, getXPProgressReadOnly } = require("../../utils/users");
const { calcularXPNecessario } = require("../../utils/xp");

module.exports = {
    name: ["checkativo"],
    description: "Mostra o perfil de XP de um membro",
    category: "admin",
    async execute(ctx) {
        if (!ctx.isGroup) return replyNYX(ctx, "❌ Apenas grupos.", "user");

        const target = getTarget(ctx);
        if (!target) return replyNYX(ctx, "❌ Marque ou responda alguém para ver o perfil.", "user");

        const user = getExistingUser([target]);
        
        if (!user) {
            return replyNYX(ctx, "⚠️ Este usuário ainda não tem dados registrados neste bot.", "user");
        }

        const progresso = getXPProgressReadOnly(user, ctx.chat);
        const necessario = calcularXPNecessario(progresso.level);
        
        const percentual = Math.min(100, Math.max(0, necessario > 0 ? progresso.xp / necessario * 100 : 0));
        const preenchido = Math.round(percentual / 10);
        const barra = `${"█".repeat(preenchido)}${"░".repeat(10 - preenchido)} ${Math.floor(percentual)}%`;
        const numero = target.split("@")[0];

        const texto = `╔═━✰『 ᴘᴇʀғɪʟ ᴅᴇ ᴀᴛɪᴠɪᴅᴀᴅᴇ 』═━✰\n\n` +
                      `║╎⊹ ࣪ ˖ 👤 ▸ @${numero}\n` +
                      `║╎⊹ ࣪ ˖ ⭐ ▸ ʟᴇᴠᴇʟ: *${progresso.level}*\n` +
                      `║╎⊹ ࣪ ˖ ✨ ▸ xᴘ: *${progresso.xp} / ${necessario}*\n` +
                      `║╎⊹ ࣪ ˖ 💬 ▸ ᴍsɢs: *${progresso.messages}*\n` +
                      `║╎⊹ ࣪ ˖ 📊 ▸ ${barra}\n` +
                      `║╎⊹ ࣪ ˖ 💎 ▸ ᴛᴏᴛᴀʟ: *${progresso.xpTotal} xᴘ*\n\n` +
                      `╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, { text: texto, mentions: [target] }, "bot");
    }
};
