const { getSetting } = require("../../utils/groups");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["prefixos", "meusprefixos"],
    description: "Lista todos os prefixos do grupo",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { chat, isAdmin } = ctx;
        if (!isAdmin) return replyNYX(ctx, "❌ Apenas administradores.", "user");

        const principal = getSetting(chat, "prefix") || "7";
        const extras = getSetting(chat, "extrasPrefixos") || [];

        let texto = `⚙️ *PREFIXOS DO GRUPO*\n\n`;
        texto += `🔹 Principal: *${principal}*\n`;
        
        if (extras.length > 0) {
            texto += `🔸 Extras: *${extras.join(", ")}*\n\n`;
            texto += `Use qualquer um deles para chamar o bot!`;
        } else {
            texto += `\n_Nenhum prefixo extra cadastrado._`;
        }

        return replyNYX(ctx, texto, "user");
    }
};