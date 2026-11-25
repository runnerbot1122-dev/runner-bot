const replyNYX = require("../../utils/replyNYX");
const { getTarget } = require("../../utils/checkTarget");

function extrairStatus(resultado) {
    if (!resultado) return "";
    if (typeof resultado === "string") return resultado;
    if (Array.isArray(resultado)) return extrairStatus(resultado[0]);
    return resultado.status || resultado.about || resultado.bio || "";
}

module.exports = {
    name: ["getbio"],
    description: "Mostra a biografia/status do WhatsApp",
    execute: async (ctx) => {
        const alvo = getTarget(ctx) || ctx.sender;
        const numero = String(alvo).split("@")[0];

        try { await ctx.react("📝"); } catch (e) {}

        try {
            const resultado = await ctx.sock.fetchStatus(alvo);
            const bio = extrairStatus(resultado);

            if (!bio) {
                return replyNYX(ctx, `📝 @${numero} não possui uma biografia/status visível.`, "user");
            }

            await replyNYX(ctx, {
                text:
`╔═━✰『 ʙɪᴏɢʀᴀғɪᴀ 』═━✰

║╎⊹ ࣪ ˖ 👤 ▸ @${numero}
║╎⊹ ࣪ ˖ 📝 ▸ ${bio}

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`,
                mentions: [alvo]
            }, "bot");
        } catch (error) {
            console.error("[GETBIO] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui consultar a biografia desse usuário. Ela pode estar privada ou indisponível.", "bot");
        }
    }
};
