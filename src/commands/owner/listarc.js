const ownerOnly = require("../../utils/ownerOnly");
const { getGlobalReactionKeywords } = require("../../utils/groups");

module.exports = {
    name: ["listarc", "listarreacoes", "listarreacao"],
    description: "Lista todas as reações automáticas globais",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const gatilhos = getGlobalReactionKeywords();
        
        if (gatilhos.length === 0) {
            return ctx.replyNYX("ℹ️ Nenhuma reação automática global cadastrada.", "bot");
        }

        let texto = `📋 *REAÇÕES AUTOMÁTICAS GLOBAIS*\n\n`;
        for (const item of gatilhos) {
            texto += `• "${item.trigger}" → ${item.emoji}\n`;
        }

        return ctx.replyNYX(texto, "bot");
    }
};
