const path = require("path");
const { requireOwner } = require("../../utils/checkPermission");
const { salvarImagemMenu } = require("../../utils/menuImageStore");

const DESTINOS = Object.freeze({
    admin: "admin.jpg",
    dono: "dono.jpg",
    ia: "ia.jpg",
    downloads: "downloads.jpg",
    brincadeiras: "brincadeiras.jpg"
});

function argumentosAceitos() {
    return Object.keys(DESTINOS).join(", ");
}

async function falhar(ctx, mensagem, codigo) {
    await ctx.reply(mensagem);
    throw new Error(codigo);
}

module.exports = {
    name: ["fotomenu"],
    description: "Altera a imagem de um menu de categoria",

    execute: async (ctx) => {
        requireOwner(ctx);

        const args = Array.isArray(ctx.args) ? ctx.args : [];
        if (args.length !== 1) {
            return falhar(
                ctx,
                `❌ Informe o menu: ${argumentosAceitos()}.`,
                "FOTOMENU_ARGUMENT"
            );
        }

        const categoria = typeof args[0] === "string"
            ? args[0].trim().toLowerCase()
            : "";
        const arquivo = DESTINOS[categoria];
        if (!arquivo) {
            return falhar(
                ctx,
                `❌ Menu inválido. Use: ${argumentosAceitos()}.`,
                "FOTOMENU_INVALID_ARGUMENT"
            );
        }

        const destino = path.join(
            process.cwd(),
            "assets",
            "menus",
            arquivo
        );

        try {
            await salvarImagemMenu(ctx, destino);
        } catch (erro) {
            console.error("Erro fotomenu:", erro);
            return falhar(
                ctx,
                "❌ Não foi possível atualizar a imagem do menu.",
                "FOTOMENU_MEDIA_OR_STORAGE"
            );
        }

        return ctx.replyNYX(
            `Imagem do menu ${categoria} atualizada com sucesso.`,
            "bot"
        );
    }
};

module.exports.DESTINOS = DESTINOS;
