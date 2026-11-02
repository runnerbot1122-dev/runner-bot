const ownerOnly = require("../../utils/ownerOnly");
const database = require("../../database/database");

module.exports = {
    name: ["aniversario-global", "aniversarioglobal"],
    description: "Gerencia o sistema de aniversários globais",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const acao = ctx.args[0]?.toLowerCase();
        
        // Se não passar ação, mostra como usar
        if (!acao) {
            return ctx.replyNYX(
                `🎂 *ANIVERSÁRIO GLOBAL*\n\n` +
                `Use:\n` +
                `${ctx.prefix}aniversario-global on - Ativar\n` +
                `${ctx.prefix}aniversario-global off - Desativar\n` +
                `${ctx.prefix}aniversario-global add @user DD/MM - Adicionar\n` +
                `${ctx.prefix}aniversario-global list - Listar`, 
                "bot"
            );
        }

        // Simulação de banco de dados (adapte para o seu database.js)
        if (!database.aniversarios) database.aniversarios = { ativo: false, lista: {} };

        if (acao === "on" || acao === "off") {
            database.aniversarios.ativo = (acao === "on");
            // database.save(); // Descomente se tiver função de salvar
            return ctx.replyNYX(`✅ Aniversário Global ${acao === "on" ? "ATIVADO" : "DESATIVADO"}.`, "bot");
        }

        if (acao === "add") {
            const target = require("../../utils/checkTarget").getTarget(ctx);
            const data = ctx.args[2]; // Pega o DD/MM

            if (!target || !data || !/^\d{2}\/\d{2}$/.test(data)) {
                return ctx.replyNYX("❌ Use: `7aniversario-global add @user 25/12`", "bot");
            }

            database.aniversarios.lista[target] = data;
            return ctx.replyNYX(`🎉 Aniversário de @${target.split("@")[0]} salvo para ${data}.`, "bot");
        }

        if (acao === "list") {
            const lista = Object.entries(database.aniversarios.lista);
            if (lista.length === 0) return ctx.replyNYX("📭 Nenhum aniversário cadastrado.", "bot");

            let texto = `🎂 *ANIVERSÁRIOS CADASTRADOS*\n\n`;
            lista.forEach(([jid, data]) => {
                texto += `• @${jid.split("@")[0]} - ${data}\n`;
            });
            return ctx.replyNYX({ text: texto, mentions: lista.map(l => l[0]) }, "bot");
        }
    }
};