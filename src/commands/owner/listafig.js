const fs = require("fs");
const path = require("path");
const { desserializarClip, enviarFigurinha } = require("../../utils/soundStickerKit");

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
            const arquivoPath = path.join(pasta, arquivo);
            const buffer = fs.readFileSync(arquivoPath);
            let clip = null;
            const sidecar = `${arquivoPath}.sound.json`;
            if (fs.existsSync(sidecar)) {
                try { clip = desserializarClip(JSON.parse(fs.readFileSync(sidecar, "utf8"))); }
                catch (erro) { console.error(`[LISTAFIG] Sidecar inválido (${arquivo}):`, erro.message); }
            }
            await enviarFigurinha(ctx.sock, ctx.chat, { webp: buffer, clip });
        }
    }
};
