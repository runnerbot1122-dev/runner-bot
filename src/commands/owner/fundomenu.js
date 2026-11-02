const path = require("path");
const { requireOwner } = require("../../utils/checkPermission");
const { salvarImagemMenu } = require("../../utils/menuImageStore");
const sendMenuPrincipal = require("../../utils/sendMenuReferencia.funcionando");

const ARQUIVO_FUNDO = "principal-fundo.jpg";

async function falhar(ctx, mensagem, codigo) {
    await ctx.reply(mensagem);
    throw new Error(codigo);
}

module.exports = {
    name: ["fundomenu"],
    description: "Altera o fundo do cabeçalho do menu principal",

    execute: async (ctx) => {
        requireOwner(ctx);

        const destino = path.join(
            process.cwd(),
            "assets",
            "menus",
            ARQUIVO_FUNDO
        );

        try {
            await salvarImagemMenu(
                ctx,
                destino,
                arquivo => {
                    sendMenuPrincipal.invalidateImageCache(arquivo);
                }
            );
        } catch (erro) {
            console.error("Erro fundomenu:", erro);
            return falhar(
                ctx,
                "❌ Não foi possível atualizar o fundo do menu principal.",
                "FUNDOMENU_MEDIA_OR_STORAGE"
            );
        }

        return ctx.replyNYX(
            "Fundo do menu principal atualizado com sucesso.",
            "bot"
        );
    }
};

module.exports.ARQUIVO_FUNDO = ARQUIVO_FUNDO;
