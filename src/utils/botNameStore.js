const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const config = require("../config/config");

const arquivo = path.join(__dirname, "../config/bot-name.json");

function getBotName() {
    try {
        if (fs.existsSync(arquivo)) {
            const dados = JSON.parse(fs.readFileSync(arquivo, "utf8"));
            if (typeof dados.name === "string" && dados.name.trim()) {
                return dados.name.trim();
            }
        }
    } catch (erro) {
        console.error("Erro ao ler o nome personalizado do bot:", erro.message);
    }

    return config.botName;
}

function setBotName(nome) {
    if (typeof nome !== "string" || !nome.trim()) {
        throw new Error("O nome não pode ficar vazio.");
    }

    nome = nome.trim();

    if (nome.length > 40 || /[\r\n]/.test(nome)) {
        throw new Error("Use um nome de até 40 caracteres, sem quebras de linha.");
    }

    const conteudo =
        JSON.stringify({ name: nome }, null, 2) + "\n";

    gravarAtomico(conteudo);

    return nome;
}

function gravarAtomico(conteudo) {
    const diretorio = path.dirname(arquivo);
    const temporario = path.join(
        diretorio,
        `.${path.basename(arquivo)}.${process.pid}.${randomUUID()}.tmp`
    );

    let descritor;
    let temporarioCriado = false;

    try {
        descritor = fs.openSync(temporario, "wx");
        temporarioCriado = true;

        fs.writeFileSync(descritor, conteudo, "utf8");
        fs.closeSync(descritor);
        descritor = undefined;

        fs.renameSync(temporario, arquivo);
        temporarioCriado = false;
    } catch (erro) {
        if (descritor !== undefined) {
            try {
                fs.closeSync(descritor);
            } catch (erroFechamento) {
                erro.erroFechamentoTemporario = erroFechamento;
            }
        }

        if (temporarioCriado) {
            try {
                fs.unlinkSync(temporario);
            } catch (erroRemocao) {
                if (erroRemocao.code !== "ENOENT") {
                    erro.erroRemocaoTemporario = erroRemocao;
                }
            }
        }

        throw erro;
    }
}

module.exports = { getBotName, setBotName };
