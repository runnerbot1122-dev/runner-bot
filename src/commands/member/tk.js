const replyNYX = require("../../utils/replyNYX");
const { getSoundStickerKit } = require("../../utils/soundStickerKit");

function obterNomeExecutor(ctx) {
    const pushName = String(ctx.message?.pushName || "").trim();
    if (pushName) return pushName.slice(0, 64);
    const remetente = String(ctx.sender || "").split("@")[0].trim();
    return remetente.slice(0, 64) || "Usuário";
}

module.exports = {
    name: ["tk", "take", "roubar"],
    description: "Renomeia uma figurinha citada com o nome do executor, mantendo o som",
    execute: async (ctx) => {
        const frasesEspera = [
            "🏷️ Só um momento, estou preparando sua figurinha.",
            "🛠️ Tô atualizando os créditos da figurinha...",
            "✂️ Aplicando o novo nome ao pacote.",
            "🤏 Calma, tô preparando a figurinha pra você.",
            "🎨 Aplicando os metadados...",
            "🕵️ Trabalhando na arte, aguarde.",
            "⚡ Já vai ficar com a sua marca!",
            "📦 Desempacotando a figurinha...",
            "🧬 Alterando o DNA da figurinha.",
            "⏳ Um instante, a mágica tá rolando."
        ];

        try {
            const kit = await getSoundStickerKit();
            const sticker = kit.stickerOf(kit.quotedOf(ctx.message)) || kit.stickerOf(kit.unwrapMessage(ctx.message?.message));
            if (!sticker) {
                return replyNYX(ctx,
                    `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ 🏷️ ▸ Responda a uma figurinha com *${ctx.prefix}tk* ou *${ctx.prefix}take*.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`,
                    "bot");
            }

            const frase = frasesEspera[Math.floor(Math.random() * frasesEspera.length)];
            await ctx.reply(frase);
            await kit.trocarPacote(ctx.sock, ctx.chat, sticker, {
                quoted: ctx.message,
                packname: obterNomeExecutor(ctx),
                author: ""
            });
        } catch (erro) {
            console.error("[TK/TAKE] Erro:", erro.message);
            return replyNYX(ctx,
                `╔═━✰『 ᴇʀʀᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ ❌ ▸ Não consegui renomear essa figurinha.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`,
                "bot");
        }
    }
};
