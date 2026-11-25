const replyNYX = require("../../utils/replyNYX");

const respostas = [
    "Sim, as chances são boas.",
    "Não parece uma boa ideia agora.",
    "Talvez. Tente novamente mais tarde.",
    "Com certeza!",
    "Eu não contaria com isso.",
    "Tudo indica que sim.",
    "A resposta ainda não está clara.",
    "Vai dar certo, mas tenha paciência."
];

function textoCitado(ctx) {
    const citado = ctx.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    return citado?.conversation || citado?.extendedTextMessage?.text || "";
}

module.exports = {
    name: ["responda"],
    description: "Responde uma pergunta aleatoriamente",
    execute: async (ctx) => {
        const pergunta = ctx.args.join(" ").trim() || textoCitado(ctx);

        if (!pergunta) {
            return replyNYX(ctx, `🔮 *RESPONDA*\n\nUso: *${ctx.prefix}responda <pergunta>*\nVocê também pode responder a uma mensagem com o comando.`, "bot");
        }

        const resposta = respostas[Math.floor(Math.random() * respostas.length)];

        try { await ctx.react("🔮"); } catch (e) {}

        await replyNYX(ctx,
`╔═━✰『 ʀᴇsᴘᴏsᴛᴀ ᴅᴏ ʙᴏᴛ 』═━✰

║╎⊹ ࣪ ˖ ❓ ▸ ${pergunta}
║╎⊹ ࣪ ˖ 🔮 ▸ *${resposta}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
    }
};
