const ownerOnly = require("../../utils/ownerOnly");
const sendNYX = require("../../utils/sendNYX");

module.exports = {
    name: ["divmsg", "divid", "divulgar"],
    description: "Envia uma mensagem para todos os grupos ou para um grupo específico",
    execute: async (ctx) => {
        ownerOnly(ctx);

        // Pega o texto que foi passado após o comando
        const textoDivulgacao = ctx.args.join(" ").trim();

        if (!textoDivulgacao) {
            return ctx.replyNYX("❌ Uso correto: `7divmsg <mensagem>` ou `7divmsg <ID do grupo> | <mensagem>`", "user");
        }

        // Verifica se o usuário passou um ID de grupo específico (separado por "|" ou espaço)
        let gruposParaEnviar = [];
        let mensagemFinal = textoDivulgacao;
        let enviarTodos = true;

        if (textoDivulgacao.includes("|")) {
            const partes = textoDivulgacao.split("|");
            const idGrupo = partes[0].trim();
            mensagemFinal = partes.slice(1).join("|").trim();
            
            if (idGrupo.endsWith("@g.us")) {
                gruposParaEnviar = [idGrupo];
                enviarTodos = false;
            }
        }

        // Se for para todos, pega a lista do banco de dados de grupos
        if (enviarTodos) {
            try {
                const database = require("../../database/database");
                gruposParaEnviar = Object.keys(database.groups || {}).filter(id => id.endsWith("@g.us"));
            } catch (e) {
                return ctx.replyNYX("❌ Não foi possível carregar a lista de grupos.", "bot");
            }
        }

        if (gruposParaEnviar.length === 0) {
            return ctx.replyNYX("❌ Nenhum grupo encontrado para enviar.", "bot");
        }

        await ctx.replyNYX(`⏳ Iniciando divulgação para ${gruposParaEnviar.length} grupo(s)...`, "bot");

        let enviados = 0;
        let falhas = 0;

        // Loop de envio com atraso para não ser bloqueado
        for (const grupoId of gruposParaEnviar) {
            try {
                // Aqui usamos o sendNYX para manter a fonte bonita se desejar, ou enviamos direto
                await ctx.sock.sendMessage(grupoId, { text: mensagemFinal });
                enviados++;
                
                // Atraso de 1.5 a 3 segundos entre envios (proteção contra ban)
                await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1500) + 1500));
                
            } catch (e) {
                console.error(`Erro ao enviar divulgação para ${grupoId}:`, e.message);
                falhas++;
            }
        }

        // Envia o relatório para o dono no privado
        await ctx.sock.sendMessage(ctx.sender, {
            text: `📢 *Relatório de Divulgação*\n\n✅ Enviados com sucesso: ${enviados}\n❌ Falhas: ${falhas}\n\nMensagem enviada:\n"${mensagemFinal}"`
        });

        return ctx.replyNYX("✅ Divulgação finalizada, mestre! Verifique seu privado para o relatório.", "user");
    }
};