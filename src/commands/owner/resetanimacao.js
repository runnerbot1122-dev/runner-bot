const fs = require("fs");
const path = require("path");

const ANIMACOES = Object.freeze({
    admin: "menuadm.mp4",
    dono: "menudono.mp4",
    brincadeiras: "menubrincadeiras.mp4",
    downloads: "menudownload.mp4",
    ia: "menuia.mp4"
});

function caminhoEstaDentro(diretorio, destino) {
    const relativo = path.relative(diretorio, destino);

    return Boolean(relativo) &&
        relativo !== ".." &&
        !relativo.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativo);
}

function mesmosCaminhos(primeiro, segundo) {
    const caminhoA = path.resolve(primeiro);
    const caminhoB = path.resolve(segundo);

    if (process.platform === "win32") {
        return caminhoA.toLowerCase() === caminhoB.toLowerCase();
    }

    return caminhoA === caminhoB;
}

function erroDeArquivoAusente(erro) {
    return erro && erro.code === "ENOENT";
}

module.exports = {
    name: "resetanimacao",
    description: "Remove a animação personalizada de um menu",

    execute: async (ctx) => {
        if (!ctx.isOwner) {
            return ctx.reply("❌ Apenas o dono pode usar este comando.");
        }

        const argumentos = Array.isArray(ctx.args) ? ctx.args : [];
        const categoriaInformada = argumentos[0];
        const categoria = typeof categoriaInformada === "string"
            ? categoriaInformada.trim().toLowerCase()
            : "";

        if (argumentos.length !== 1 || !Object.hasOwn(ANIMACOES, categoria)) {
            return ctx.reply(
                "❌ Informe uma categoria válida.\n" +
                "Uso: 7resetanimacao <categoria>\n" +
                `Categorias: ${Object.keys(ANIMACOES).join(", ")}`
            );
        }

        let raizProjeto;
        let diretorioAnimacoes;
        let destino;

        try {
            raizProjeto = fs.realpathSync(process.cwd());
            diretorioAnimacoes = path.resolve(
                raizProjeto,
                "assets",
                "menus",
                "animacoes"
            );
            destino = path.resolve(diretorioAnimacoes, ANIMACOES[categoria]);

            if (!caminhoEstaDentro(diretorioAnimacoes, destino)) {
                return ctx.reply(
                    "❌ O caminho da animação é inválido; nenhum arquivo foi removido."
                );
            }

            let informacoesDiretorio;
            try {
                informacoesDiretorio = fs.lstatSync(diretorioAnimacoes);
            } catch (erro) {
                if (erroDeArquivoAusente(erro)) {
                    return ctx.reply(
                        `ℹ️ Não há animação configurada para "${categoria}". ` +
                        "O menu continua usando a imagem estática."
                    );
                }

                throw erro;
            }

            if (
                informacoesDiretorio.isSymbolicLink() ||
                !informacoesDiretorio.isDirectory()
            ) {
                return ctx.reply(
                    "❌ O diretório de animações é inválido; nenhum arquivo foi removido."
                );
            }

            const caminhoRealDiretorio = fs.realpathSync(diretorioAnimacoes);
            if (!mesmosCaminhos(caminhoRealDiretorio, diretorioAnimacoes)) {
                return ctx.reply(
                    "❌ O diretório de animações resolve para outro local; " +
                    "nenhum arquivo foi removido."
                );
            }

            let informacoesDestino;
            try {
                informacoesDestino = fs.lstatSync(destino);
            } catch (erro) {
                if (erroDeArquivoAusente(erro)) {
                    return ctx.reply(
                        `ℹ️ Não há animação configurada para "${categoria}". ` +
                        "O menu continua usando a imagem estática."
                    );
                }

                throw erro;
            }

            if (
                informacoesDestino.isSymbolicLink() ||
                !informacoesDestino.isFile()
            ) {
                return ctx.reply(
                    "❌ A animação selecionada não é um arquivo regular; " +
                    "nenhum arquivo foi removido."
                );
            }

            fs.unlinkSync(destino);
        } catch (erro) {
            console.error("Erro resetanimacao:", erro);
            return ctx.reply(
                "❌ Não foi possível remover a animação. Nenhum outro arquivo foi alterado."
            );
        }

        return ctx.reply(
            `✅ Animação da categoria "${categoria}" removida. ` +
            "O menu voltará a usar a imagem estática original."
        );
    }
};
