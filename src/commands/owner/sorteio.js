const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["sorteio", "sortear"],
    description: "Sorteia um membro do grupo",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use este comando dentro de um grupo.", "user");

        const premio = ctx.args.join(" ").trim();

        let metadata;
        try {
            metadata = await ctx.sock.groupMetadata(ctx.chat);
        } catch {
            return ctx.replyNYX("❌ Não consegui obter a lista de membros do grupo.", "bot");
        }

        // Filtra para remover o bot da lista de sorteados
        const botJid = ctx.sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
        const participantes = metadata.participants.filter(p => {
            const id = p.id || p.jid || p.lid;
            return id && id !== botJid;
        });

        if (participantes.length === 0) {
            return ctx.replyNYX("ℹ️ Não há membros suficientes para sortear.", "bot");
        }

        // Escolhe um aleatoriamente
        const escolhido = participantes[Math.floor(Math.random() * participantes.length)];
        const jidEscolhido = escolhido.id || escolhido.jid || escolhido.lid;

        // Monta a mensagem bonita
        let mensagem = `🎲 *SORTEIO REALIZADO!*\n\n`;
        
        if (premio) {
            mensagem += `🎁 *Prêmio:* ${premio}\n\n`;
        }
        
        mensagem += `🏆 *O escolhido da vez foi...*\n\n`;
        mensagem += `👑 @${jidEscolhido.split("@")[0]}\n\n`;
        mensagem += `Parabéns! 🎉`;

        await ctx.replyNYX({
            text: mensagem,
            mentions: [jidEscolhido]
        }, "user");
    }
};