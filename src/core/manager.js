console.log("Manager carregado!");

const iniciarConexao = require("./connection");
const config = require("../config/config");
const { obterEstado } = require("./restartState");
const atualizarYtdlp = require("../utils/atualizarYtdlp"); // 🤖 NOVO: Importação do auto-update

const TEMPO_RECONEXAO = 5000;

// A referência do socket vive no estado por sessão; este objeto mantém a API
// de leitura usada pelo restante do projeto sem criar um segundo mapa.
const bots = Object.freeze({
    get(id) {
        return obterEstado(id).socket || undefined;
    },
    has(id) {
        return Boolean(obterEstado(id).socket);
    }
});

function cancelarTemporizador(estado) {
    if (estado.temporizador !== null) {
        clearTimeout(estado.temporizador);
        estado.temporizador = null;
        estado.tipoTemporizador = null;
    }
}

function fecharSocket(sock, contexto) {
    try {
        const resultado = sock?.ws?.close?.();

        if (resultado && typeof resultado.catch === "function") {
            resultado.catch((erro) => {
                console.error(`Falha ao fechar socket (${contexto}):`, erro.message);
            });
        }
    } catch (erro) {
        console.error(`Falha ao fechar socket (${contexto}):`, erro.message);
    }
}

function agendarConexao(id, tipo) {
    const estado = obterEstado(id);

    if (tipo === "auto" && estado.deslogado) return;

    if (estado.tentativa) {
        if (tipo === "manual") estado.reinicioAposTentativa = true;
        else estado.reconexaoAposTentativa = true;
        return;
    }

    if (estado.temporizador !== null) {
        if (estado.tipoTemporizador === "manual" || estado.tipoTemporizador === tipo) {
            return;
        }

        cancelarTemporizador(estado);
    }

    const geracao = estado.geracao;
    let temporizador;

    temporizador = setTimeout(() => {
        if (estado.temporizador !== temporizador) return;

        estado.temporizador = null;
        estado.tipoTemporizador = null;

        if (estado.geracao !== geracao) return;
        if (tipo === "auto" && estado.deslogado) return;

        estado.reinicioAposTentativa = false;
        estado.reconexaoAposTentativa = false;

        Promise.resolve()
            .then(() => {
                let operacao;

                try {
                    operacao = criarBot(id);
                } catch (erro) {
                    if (tipo === "manual") estado.reinicioManualAtivo = false;
                    throw erro;
                }

                const geracaoTentativa = estado.geracao;

                if (tipo === "manual") {
                    // Keep duplicate manual requests coalesced during socket
                    // creation, but release the lock when this generation's
                    // attempt settles; Baileys may never emit "open".
                    return Promise.resolve(operacao).finally(() => {
                        if (
                            estado.geracao === geracaoTentativa &&
                            estado.tentativa === null
                        ) {
                            estado.reinicioManualAtivo = false;
                        }
                    });
                }

                return operacao;
            })
            .catch((erro) => {
                console.error("Falha ao iniciar reconexão:", erro.message);
            });
    }, TEMPO_RECONEXAO);

    estado.temporizador = temporizador;
    estado.tipoTemporizador = tipo;
}

function tratarFechamento(id, geracao, sock, loggedOut) {
    const estado = obterEstado(id);

    // Um socket antigo não pode limpar nem substituir o estado de uma geração nova.
    if (estado.geracao !== geracao) return;

    if (estado.status === "pairingBlocked") {
        cancelarTemporizador(estado);
        estado.reconexaoAposTentativa = false;
        if (estado.socket === sock) estado.socket = null;
        return;
    }

    if (estado.socket === sock) estado.socket = null;

    if (loggedOut) {
        cancelarTemporizador(estado);
        estado.deslogado = true;
        estado.status = "loggedOut";
        estado.reconexaoAposTentativa = false;
        estado.reinicioAposTentativa = false;
        estado.reinicioManualAtivo = false;
        return;
    }

    estado.status = "disconnected";

    if (estado.tentativa) {
        estado.reconexaoAposTentativa = true;
        return;
    }

    agendarConexao(id, "auto");
}

function criarBot(id) {
    const estado = obterEstado(id);

    if (estado.tentativa) return estado.tentativa;
    if (estado.temporizador !== null) return Promise.resolve(estado.socket);
    if (estado.deslogado) return Promise.resolve(null);
    if (estado.socket) return Promise.resolve(estado.socket);

    console.log("Iniciando bot:", id);

    const geracao = ++estado.geracao;
    estado.status = "connecting";
    estado.reconexaoAposTentativa = false;

    let tentativa;

    tentativa = Promise.resolve()
        .then(() => iniciarConexao(id, {
            geracao,
            registrarSocket(sock, geracaoCallback = geracao) {
                if (
                    geracaoCallback !== geracao ||
                    estado.geracao !== geracao ||
                    estado.tentativa !== tentativa ||
                    estado.deslogado
                ) {
                    return false;
                }

                estado.socket = sock;
                return true;
            },
            socketAindaAtual(sock, geracaoCallback = geracao) {
                return (
                    estado.geracao === geracaoCallback &&
                    estado.socket === sock
                );
            },
            aoAbrir(sock, geracaoCallback = geracao) {
                if (
                    estado.geracao !== geracaoCallback ||
                    estado.socket !== sock
                ) {
                    return false;
                }

                estado.status = "open";
                estado.reinicioManualAtivo = false;
                return true;
            },
            aoFechar({ socket, geracao: geracaoCallback, loggedOut }) {
                tratarFechamento(id, geracaoCallback, socket, loggedOut);
            }
        }))
        .then((sock) => {
            if (estado.geracao === geracao && estado.socket === sock) {
                console.log("Conexão criada!");
            }

            return sock;
        })
        .catch((erro) => {
            if (estado.geracao === geracao && estado.tentativa === tentativa) {
                const bloqueioPareamento =
                    erro?.pairingConfiguration === true;

                if (estado.socket) {
                    fecharSocket(estado.socket, "falha ao iniciar");
                    estado.socket = null;
                }

                estado.status = bloqueioPareamento
                    ? "pairingBlocked"
                    : "disconnected";
                estado.reinicioManualAtivo = false;
                estado.reconexaoAposTentativa = !bloqueioPareamento;
                console.error("Falha ao iniciar conexão:", erro.message);
            }

            return null;
        })
        .finally(() => {
            if (estado.tentativa !== tentativa) return;

            estado.tentativa = null;

            if (estado.reinicioAposTentativa) {
                estado.reinicioAposTentativa = false;
                estado.reconexaoAposTentativa = false;
                agendarConexao(id, "manual");
                return;
            }

            if (estado.deslogado || estado.geracao !== geracao) return;

            if (estado.reconexaoAposTentativa || estado.status === "disconnected") {
                estado.reconexaoAposTentativa = false;
                agendarConexao(id, "auto");
            }
        });

    estado.tentativa = tentativa;
    return tentativa;
}

function reiniciarBot(id) {
    console.log("Solicitado restart:", id);

    const estado = obterEstado(id);

    if (estado.reinicioManualAtivo) return Promise.resolve(null);

    cancelarTemporizador(estado);

    const antigo = estado.socket;
    estado.geracao++;
    estado.socket = null;
    estado.deslogado = false;
    estado.status = "restarting";
    estado.reinicioManualAtivo = true;
    estado.reconexaoAposTentativa = false;
    estado.reinicioAposTentativa = Boolean(estado.tentativa);

    if (antigo) {
        fecharSocket(antigo, "reinício manual");
        console.log("Conexão antiga fechada.");
    }

    console.log("Aguardando nova conexão...");

    if (!estado.tentativa) agendarConexao(id, "manual");

    return Promise.resolve(null);
}

// A inicialização é iniciada ao carregar o manager; o erro é absorvido e
// registrado dentro de criarBot, evitando rejeições não tratadas.
criarBot(config.sessionName).catch((erro) => {
    console.error("Falha ao iniciar bot:", erro.message);
});

// 🤖 NOVO: Inicia a checagem de atualização do yt-dlp em background (não trava o bot)
setTimeout(() => {
    atualizarYtdlp().catch(err => console.log("[YT-DLP BG ERRO]", err.message));
}, 5000);

module.exports = {
    bots,
    criarBot,
    reiniciarBot
};