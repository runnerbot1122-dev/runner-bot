const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["divulgacao", "broadcast"],
    description: "Envia uma divulgação formatada para todos os grupos",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const texto = ctx.args.join(" ").trim();
        if (!texto) {
            return ctx.replyNYX("❌ Uso: `7divulgacao <mensagem>`", "user");
        }

        let groups;
        try {
            groups = await ctx.sock.groupFetchAllParticipating();
        } catch {
            return ctx.replyNYX("❌ Não consegui obter a lista de grupos.", "bot");
        }

        // Filtra para remover o grupo atual, caso seja um grupo
        const ids = Object.keys(groups || {}).filter(id => id.endsWith("@g.us") && id !== ctx.chat);
        
        if (!ids.length) {
            return ctx.replyNYX("ℹ️ Nenhum outro grupo encontrado.", "bot");
        }

        await ctx.replyNYX(`⏳ Enviando divulgação para ${ids.length} grupo(s)...`, "bot");

        const mensagemFormatada = `📢 *DIVULGAÇÃO*\n\n${texto}`;
        let enviados = 0;
        let falhas = 0;

        for (const id of ids) {
            try {
                await ctx.sock.sendMessage(id, { text: mensagemFormatada });
                enviados++;
                // Delay aleatório entre 2s e 4s para segurança anti-ban
                await new Promise(r => setTimeout(r, Math.floor(Math.random() * 2000) + 2000));
            } catch (e) {
                console.error(`Falha na divulgação para ${id}:`, e.message);
                falhas++;
            }
        }

        await ctx.sock.sendMessage(ctx.sender, {
            text: `📢 *Relatório Divulgação*\n\n✅ Enviados: ${enviados}\n❌ Falhas: ${falhas}\n\nMensagem: "${texto}"`
        });

        return ctx.replyNYX(`✅ Divulgação concluída! ${enviados} enviados.`, "user");
    }
};