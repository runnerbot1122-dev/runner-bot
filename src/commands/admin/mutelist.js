const { requireAdmin } = require("../../utils/checkPermission");
const mutes = require("../../utils/mutes");

module.exports = {
    name: ["mutelist"],
    description: "Lista os usuários mutados no grupo",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        // Assumindo que o mutes.js tem uma função listar ou um objeto público
        let lista = [];
        try {
            if (typeof mutes.listar === "function") lista = mutes.listar(ctx.chat);
            else if (mutes.data && mutes.data[ctx.chat]) lista = Object.keys(mutes.data[ctx.chat]);
        } catch (_) {}

        if (lista.length === 0) return ctx.replyNYX("✅ Nenhum usuário mutado.", "bot");
        
        let texto = `🔇 *MUTADOS (${lista.length})*\n\n`;
        lista.forEach((id, i) => texto += `${i+1}. @${id.split("@")[0]}\n`);
        
        await ctx.replyNYX({ text: texto, mentions: lista }, "user");
    }
};