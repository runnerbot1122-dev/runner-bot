const replyNYX = require("../../utils/replyNYX");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["rankinteligente"],
    description: "Ranking dos mais inteligentes do grupo",
    execute: async (ctx) => {
        const { sock, chat } = ctx;
        if (!ctx.isGroup) return replyNYX(ctx, "❌ Apenas grupos.", "user");
        try {
            const metadata = await sock.groupMetadata(chat);
            const membros = metadata.participants.map(p => p.id).filter(id => !id.includes(sock.user.id.split(":")[0]));
            if (membros.length === 0) return replyNYX(ctx, "❌ Sem membros suficientes.", "user");
            const sorteados = membros.sort(() => 0.5 - Math.random()).slice(0, 5);
            const titulo = "ʀᴀɴᴋ ɪɴᴛᴇʟɪɢᴇɴᴛᴇ", emoji = "🧠";
            const frases = ["Einstein reencarnou!", "QI 300!", "Futuro ganhador do Nobel!", "Não tem erro!"];
            let texto = `╔═━✰『 ${fonteNYX(titulo)} 』═━✰\n\n`;
            sorteados.forEach((membro, index) => {
                const numero = membro.split("@")[0];
                const nota = Math.floor(Math.random() * 101);
                const fraseSorteada = fonteNYX(frases[Math.floor(Math.random() * frases.length)]);
                texto += `║╎⊹ ࣪ ˖ ${index + 1}º ${emoji} ▸ @${numero}\n║╎⊹ ࣪ ˖ 📊 ▸ ɴᴏᴛᴀ: *${nota}/100*\n║╎⊹ ࣪ ˖ 💬 ▸ _${fraseSorteada}_\n\n`;
            });
            texto += `╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;
            await replyNYX(ctx, { text: texto, mentions: sorteados }, "bot");
        } catch (e) {
            console.error("[RANK INTELIGENTE] Erro:", e.message);
            return replyNYX(ctx, "❌ Erro ao gerar o ranking.", "bot");
        }
    }
};