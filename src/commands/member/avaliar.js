const replyNYX = require("../../utils/replyNYX");
const sendNYX = require("../../utils/sendNYX");
const config = require("../../config/config");

module.exports = {
    name: ["avaliar", "feedback"],
    description: "Envia uma avaliação para o dono do bot",
    execute: async (ctx) => {
        const args = ctx.args;
        
        if (args.length < 2) {
            return replyNYX(ctx, `⭐ *AVALIAR BOT*\n\nUso: ${ctx.prefix}avaliar [nota 1-5] [comentário]\nEx: ${ctx.prefix}avaliar 5 Bot muito rápido!`, "bot");
        }

        const nota = parseInt(args[0]);
        if (isNaN(nota) || nota < 1 || nota > 5) {
            return replyNYX(ctx, "❌ A nota precisa ser um número de 1 a 5.", "bot");
        }

        const comentario = args.slice(1).join(" ");
        const estrelas = "⭐".repeat(nota);

        // Envia a avaliação para o PV do Dono (config.masterNumber)
        const numeroDono = config.masterNumber;
        if (numeroDono) {
            const textoDono = 
`📬 *NOVA AVALIAÇÃO*

👤 *De:* @${ctx.sender.split("@")[0]} (${ctx.pushName || "Membro"})
🏠 *Grupo:* ${ctx.chat}
⭐ *Nota:* ${nota}/5 ${estrelas}
💬 *Comentário:* ${comentario}`;

            try {
                await sendNYX(ctx.sock, `${numeroDono}@s.whatsapp.net`, textoDono, null, [ctx.sender]);
            } catch (e) {
                console.error("[AVALIAR] Erro ao enviar para o dono:", e.message);
            }
        }

        // Responde no grupo
        const textoGrupo = 
`╔═━✰『 ᴀᴠᴀʟɪᴀʀ 』═━✰

║╎⊹ ࣪ ˖ ✅ ▸ Obrigado pela sua avaliação!
║╎⊹ ࣪ ˖ ⭐ ▸ Nota: *${nota}/5*
║╎⊹ ࣪ ˖ 💬 ▸ Feedback enviado ao criador.

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

        await replyNYX(ctx, textoGrupo, "bot");
    }
};