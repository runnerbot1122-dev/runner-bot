const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const arquivoProjeto = path.join(__dirname, "../database/channel.json");

function obterArquivo(){
    const arquivoCwd = path.resolve("./src/database/channel.json");
    const diretorioCwd = path.dirname(arquivoCwd);
    const diretorioProjeto = path.dirname(arquivoProjeto);

    if(
        diretorioCwd !== diretorioProjeto &&
        fs.existsSync(diretorioCwd)
    ){
        return arquivoCwd;
    }

    return arquivoProjeto;
}
const LIMITE_HISTORICO = 100;

function criarRegistro(data) {
    return {
        key: data.key,
        serverId: data.serverId,
        message: data.message ?? null,
        timestamp: data.timestamp ?? null
    };
}

function validarMensagem(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new TypeError("A mensagem do canal deve ser um objeto");
    }

    if (!data.key || typeof data.key !== "object" || Array.isArray(data.key)) {
        throw new TypeError("A mensagem do canal deve conter key");
    }

    if (typeof data.serverId !== "string" || data.serverId.trim() === "") {
        throw new TypeError("serverId é obrigatório para salvar a mensagem do canal");
    }

    return criarRegistro(data);
}

function lerDadosExistentes() {
    let conteudo;

    try {
        conteudo = fs.readFileSync(obterArquivo(), "utf8");
    } catch (erro) {
        if (erro.code === "ENOENT") {
            return null;
        }

        throw erro;
    }

    const dados = JSON.parse(conteudo);

    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        throw new TypeError("O armazenamento do canal deve conter um objeto JSON");
    }

    if (
        Object.prototype.hasOwnProperty.call(dados, "history") &&
        !Array.isArray(dados.history)
    ) {
        throw new TypeError("O campo history do armazenamento do canal deve ser uma lista");
    }

    return dados;
}

function gravarAtomico(conteudo) {
    const arquivoFinal = obterArquivo();
    const diretorio = path.dirname(arquivoFinal);
    const temporario = path.join(
        diretorio,
        `.${path.basename(arquivoFinal)}.${process.pid}.${randomUUID()}.tmp`
    );

    let descritor;
    let temporarioCriado = false;

    try {
        descritor = fs.openSync(temporario, "wx");
        temporarioCriado = true;
        fs.writeFileSync(descritor, conteudo, "utf8");
        fs.closeSync(descritor);
        descritor = undefined;
        fs.renameSync(temporario, arquivoFinal);
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

function salvarMensagemCanal(data) {
    const registro = validarMensagem(data);
    const existente = lerDadosExistentes();
    let history = [];

    if (existente) {
        history = Array.isArray(existente.history)
            ? existente.history.slice()
            : [criarRegistro(existente)];
    }

    const messageId = registro.key.id;
    if (typeof messageId === "string" && messageId.trim() !== "") {
        history = history.filter((item) => item?.key?.id !== messageId);
    }

    history.push(registro);
    history = history.slice(-LIMITE_HISTORICO);

    const dadosAtualizados = {
        ...registro,
        history
    };
    const conteudo = JSON.stringify(dadosAtualizados, null, 2);

    if (typeof conteudo !== "string") {
        throw new TypeError("Não foi possível serializar a mensagem do canal");
    }

    gravarAtomico(conteudo);

    console.log("Mensagem do canal salva ✅");
}

function lerMensagemCanal() {
    return lerDadosExistentes();
}

module.exports = {
    salvarMensagemCanal,
    lerMensagemCanal
};
