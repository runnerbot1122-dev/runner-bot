const ownerOnly = require("../../utils/ownerOnly");
const db = require("../../database/securityGroups");
const { getTarget } = require("../../utils/checkTarget");

module.exports = {
    name: ["rmsubdono"],
    description: "Remove a proteção de subdono do usuário no grupo",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use este comando dentro de um grupo.", "user");

        const target = getTarget(ctx);
        if (!target) {
            return ctx.replyNYX("⚠️ Marque ou responda à mensagem de quem deseja remover do cargo de subdono.", "user");
        }

        try {
            // Assumindo que a função removeSubowner exista no seu securityGroups.js
            // Se o nome for outro (ex: removeProtected), adapte aqui.
            const changed = typeof db.removeSubowner === "function" 
                ? db.removeSubowner(ctx.chat, target) 
                : false; // Fallback se a função não existir

            if (changed) {
                return ctx.replyNYX({
                    text: `🗑️ @${target.split("@")[0]} não é mais subdono protegido neste grupo.`,
                    mentions: [target]
                }, "user");
            } else {
                return ctx.replyNYX("ℹ️ Este usuário não estava registrado como subdono.", "bot");
            }
        } catch (error) {
            console.error("[RMSUBDONO] Erro:", error);
            return ctx.replyNYX("❌ Ocorreu um erro ao tentar remover o subdono.", "bot");
        }
    }
};