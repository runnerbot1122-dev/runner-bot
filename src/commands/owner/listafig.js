const fs = require("fs");
const path = require("path");

module.exports = {
    name: ["listafig"],
    description: "Lista as figurinhas salvas (Owner)",
    execute: async (ctx) => {
        const ownerOnly = require("../../utils/ownerOnly");
        ownerOnly(ctx);

        const pasta = path.join(process.cwd(), "assets", "stickers");
        if (!fs.existsSync(pasta)) {
            return ctx.replyNYX("📭 Nenhuma figurinha salva ainda.", "bot");
        }

        const arquivos = fs.readdirSync(pasta).filter(f => f.endsWith(".webp"));
        if (arquivos.length === 0) {
            return ctx.replyNYX("📭 Nenhuma figurinha salva ainda.", "bot");
        }

        await ctx.replyNYX(`📦 Enviando ${arquivos.length} figurinha(s) salvas...`, "bot");

        for (const arquivo of arquivos) {
            const buffer = fs.readFileSync(path.join(pasta, arquivo));
            await ctx.sock.sendMessage(ctx.chat, { sticker: buffer });
        }
    }
};