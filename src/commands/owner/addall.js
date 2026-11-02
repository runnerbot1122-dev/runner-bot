const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["addall"],
    description: "Adiciona membros de outro grupo ao grupo atual",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use este comando dentro do grupo onde deseja adicionar as pessoas.", "user");

        const groupOrigem = ctx.args[0];

        if (!groupOrigem || !groupOrigem.endsWith("@g.us")) {
            return ctx.replyNYX(
                `⚙️ *Uso do AddAll:*\n\n` +
                `Para adicionar membros de outro grupo, você precisa do ID dele.\n` +
                `Exemplo: \`${ctx.prefix}addall 120363...@g.us\``,
                "bot"
            );
        }

        let metadataOrigem;
        try {
            metadataOrigem = await ctx.sock.groupMetadata(groupOrigem);
        } catch {
            return ctx.replyNYX("❌ Não consegui acessar o grupo de origem. O bot está nele?", "bot");
        }

        const membrosOrigem = metadataOrigem.participants.map(p => p.id).filter(Boolean);
        
        // Pega a lista atual do grupo destino para não tentar adicionar quem já está
        const metadataDestino = await ctx.sock.groupMetadata(ctx.chat);
        const membrosDestino = metadataDestino.participants.map(p => p.id);

        // Filtra apenas quem não está no destino
        const paraAdicionar = membrosOrigem.filter(id => !membrosDestino.includes(id));

        if (paraAdicionar.length === 0) {
            return ctx.replyNYX("ℹ️ Todos os membros do grupo de origem já estão neste grupo.", "bot");
        }

        // Limite de segurança: máximo 5 por vez para evitar ban do WhatsApp
        const limite = 5;
        const lote = paraAdicionar.slice(0, limite);

        await ctx.replyNYX(`⏳ Adicionando ${lote.length} membro(s) de uma vez...`, "bot");

        let adicionados = 0;
        let falhas = 0;

        for (const id of lote) {
            try {
                await ctx.sock.groupParticipantsUpdate(ctx.chat, [id], "add");
                adicionados++;
                // Delay de 3 segundos entre adições
                await new Promise(r => setTimeout(r, 3000));
            } catch (e) {
                console.error(`[ADDALL] Falha ao adicionar ${id}:`, e.message);
                falhas++;
            }
        }

        return ctx.replyNYX(
            `✅ *Adição concluída!*\n\n` +
            `➕ Adicionados: ${adicionados}\n` +
            `❌ Falhas (podem ter bloqueado): ${falhas}\n` +
            `👥 Restantes na fila: ${paraAdicionar.length - lote.length}\n\n` +
            `*Nota:* Se houver mais na fila, rode o comando novamente.`,
            "bot"
        );
    }
};
