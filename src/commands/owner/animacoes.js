const fs = require("fs");
const path = require("path");

const ANIMACOES = [
    { categoria: "admin", arquivo: "menuadm.mp4" },
    { categoria: "dono", arquivo: "menudono.mp4" },
    { categoria: "brincadeiras", arquivo: "menubrincadeiras.mp4" },
    { categoria: "downloads", arquivo: "menudownload.mp4" },
    { categoria: "ia", arquivo: "menuia.mp4" }
];

function verificarArquivo(caminho) {
    let informacoes;

    try {
        informacoes = fs.lstatSync(caminho);
    } catch (erro) {
        if (erro.code === "ENOENT") {
            return "ausente";
        }

        return "inválido (não foi possível verificar)";
    }

    if (!informacoes.isFile()) {
        return "inválido (não é arquivo regular)";
    }

    if (informacoes.size <= 0) {
        return "inválido (arquivo vazio)";
    }

    return "presente";
}

module.exports = {
    name: "animacoes",
    description: "Lista o estado básico das animações dos menus",

    execute: async (ctx) => {
        if (!ctx.isOwner) {
            return ctx.reply("❌ Apenas o dono pode usar este comando.");
        }

        const pastaAnimacoes = path.join(
            process.cwd(),
            "assets",
            "menus",
            "animacoes"
        );
        const linhas = ANIMACOES.map(({ categoria, arquivo }) => {
            const caminho = path.join(pastaAnimacoes, arquivo);
            return `• ${categoria} (${arquivo}): ${verificarArquivo(caminho)}`;
        });

        return ctx.reply([
            "╭━━〔 ANIMAÇÕES DOS MENUS 〕━━╮",
            ...linhas,
            "",
            "Estado básico: verifica apenas arquivo regular e tamanho maior que zero; não valida integridade nem decodificação do MP4.",
            "╰━━━━━━━━━━━━━━━━━━━━━━╯"
        ].join("\n"));
    }
};
