const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["allgp", "allgroups", "grupos"],
    description: "Gerencia e lista os grupos onde o bot está",
    execute: async (ctx) => {
        ownerOnly(ctx);

        let groups;
        try {
            groups = await ctx.sock.groupFetchAllParticipating();
        } catch {
            return ctx.replyNYX("❌ Não consegui obter a lista de grupos.", "bot");
        }

        const ids = Object.keys(groups || {}).filter(id => id.endsWith("@g.us"));
        
        if (!ids.length) {
            return ctx.replyNYX("ℹ️ O bot não está em nenhum grupo.", "bot");
        }

        const acao = ctx.args[0]?.toLowerCase();

        // --- SAIR DE TODOS OS GRUPOS (com confirmação) ---
        if (acao === "sair") {
            if (ctx.args[1] !== "confirmar") {
                return ctx.replyNYX(`⚠️ Tem certeza que deseja sair de *${ids.length} grupos*?\nPara confirmar, use: \`${ctx.prefix}allgp sair confirmar\``, "user");
            }

            await ctx.replyNYX(`⏳ Saindo de ${ids.length} grupos...`, "bot");
            let saiu = 0;
            for (const id of ids) {
                try {
                    await ctx.sock.groupLeave(id);
                    saiu++;
                } catch (e) { console.error("Erro ao sair:", id, e.message); }
            }
            return ctx.replyNYX(`✅ Saiu de ${saiu}/${ids.length} grupos.`, "bot");
        }

        // --- ENVIAR MENSAGEM PARA UM GRUPO ESPECÍFICO ---
        // Uso: 7allgp enviar 2 | Mensagem aqui
        if (acao === "enviar") {
            const index = parseInt(ctx.args[1]) - 1;
            const texto = ctx.args.slice(2).join(" ").replace(/^\|\s*/, "").trim();

            if (isNaN(index) || index < 0 || index >= ids.length || !texto) {
                return ctx.replyNYX("❌ Uso: `7allgp enviar <numero_do_grupo> | <mensagem>`", "user");
            }

            const targetGroup = ids[index];
            try {
                await ctx.sock.sendMessage(targetGroup, { text: texto });
                return ctx.replyNYX(`✅ Mensagem enviada para o grupo #${index + 1}.`, "bot");
            } catch (e) {
                return ctx.replyNYX(`❌ Falha ao enviar: ${e.message}`, "bot");
            }
        }

        // --- LISTAR GRUPOS (Padrão) ---
        // Se tiver mais de 20 grupos, a mensagem fica muito grande, então paginamos
        let listaTexto = `📋 *GRUPOS DO BOT (${ids.length})*\n\n`;
        
        // Mostra apenas os 20 primeiros para não estourar o limite de caracteres do WhatsApp
        const limite = Math.min(ids.length, 20);
        
        for (let i = 0; i < limite; i++) {
            const id = ids[i];
            const nome = groups[id]?.subject || "Sem nome";
            listaTexto += `*${i + 1}.* ${nome}\n   \`${id}\`\n`;
        }

        if (ids.length > 20) {
            listaTexto += `\n... e mais ${ids.length - 20} grupos.`;
        }

        listaTexto += `\n\n💡 *Comandos:*\n`;
        listaTexto += `• ${ctx.prefix}allgp enviar <n> | <msg>\n`;
        listaTexto += `• ${ctx.prefix}allgp sair confirmar`;

        await ctx.replyNYX(listaTexto, "user");
    }
};