const fs = require("fs");
const path = require("path");
const ownerOnly = require("../../utils/ownerOnly");
const replyNYX = require("../../utils/replyNYX");

function safeName(value) {
    return path.basename(String(value || "").trim()).replace(/\.webp$/i, "");
}

module.exports = {
    name: ["delfig"],
    description: "Remove uma figurinha do catálogo local",

    execute: async ctx => {
        ownerOnly(ctx);

        const nome = safeName(ctx.args.join(" "));
        if (!nome || nome === "." || nome === "..") {
            return replyNYX(ctx, `🗑️ Informe o nome da figurinha.\n\nUso: ${ctx.prefix}delfig nome-da-figurinha`, "bot");
        }

        const arquivo = path.join(process.cwd(), "assets", "stickers", `${nome}.webp`);
        if (!fs.existsSync(arquivo)) {
            return replyNYX(ctx, `❌ Não encontrei a figurinha *${nome}.webp* no catálogo.`, "bot");
        }

        try {
            fs.unlinkSync(arquivo);
            return replyNYX(ctx, `✅ Figurinha *${nome}.webp* removida do catálogo.`, "bot");
        } catch (error) {
            console.error("[DELFIG] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui remover essa figurinha.", "bot");
        }
    }
};