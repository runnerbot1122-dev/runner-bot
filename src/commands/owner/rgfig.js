const fs = require("fs");
const path = require("path");
const ownerOnly = require("../../utils/ownerOnly");
const replyNYX = require("../../utils/replyNYX");
const {
    findSticker,
    downloadSticker,
    readStickerInfo
} = require("../../utils/stickerTools");

function safeName(value) {
    return String(value || "")
        .trim()
        .replace(/\.webp$/i, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

module.exports = {
    name: ["rgfig"],
    description: "Salva uma figurinha no catálogo local",

    execute: async ctx => {
        ownerOnly(ctx);

        const sticker = findSticker(ctx.message);
        if (!sticker) {
            return replyNYX(ctx, "📥 Responda a uma figurinha para salvá-la.", "bot");
        }

        try {
            const buffer = await downloadSticker(ctx, sticker);
            const info = await readStickerInfo(buffer);
            const nome = safeName(ctx.args.join(" ")) || `fig-${info.id}`;
            const pasta = path.join(process.cwd(), "assets", "stickers");
            const arquivo = path.join(pasta, `${nome}.webp`);

            fs.mkdirSync(pasta, { recursive: true });
            fs.writeFileSync(arquivo, buffer);

            return replyNYX(ctx, `✅ Figurinha salva como *${nome}.webp*.`, "bot");
        } catch (error) {
            console.error("[RGFIG] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui salvar essa figurinha.", "bot");
        }
    }
};
