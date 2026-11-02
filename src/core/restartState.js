const estados = new Map();

function obterEstado(id) {
    let estado = estados.get(id);

    if (!estado) {
        estado = {
            deslogado: false,
            geracao: 0,
            reconexaoAposTentativa: false,
            reinicioAposTentativa: false,
            reinicioManualAtivo: false,
            socket: null,
            status: "idle",
            temporizador: null,
            tipoTemporizador: null,
            tentativa: null
        };

        estados.set(id, estado);
    }

    return estado;
}

module.exports = {
    estados,
    obterEstado
};
