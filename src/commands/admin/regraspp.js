module.exports = {
    name: ["regraspp", "regraspv"],
    description: "Envia as regras do grupo no privado",
    execute: async (ctx) => {
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");
        try {
            const metadata = await ctx.sock.groupMetadata(ctx.chat);
            const descricao = metadata?.desc;

            if (!descricao || !descricao.trim()) {
                return ctx.reply("📋 Este grupo não tem regras definidas na descrição.");
            }

            await ctx.sock.sendMessage(ctx.sender, { text: `📋 *REGRAS DO GRUPO: ${metadata.subject}*\n\n${descricao}` });
            await ctx.replyNYX("✅ Regras enviadas no seu privado.", "bot");
        } catch (e) {
            await ctx.reply("❌ Não consegui enviar as regras no privado.");
        }
    }
};