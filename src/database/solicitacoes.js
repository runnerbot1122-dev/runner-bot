// src/database/solicitacoes.js
const fs = require("fs");
const path = require("path");

const DB_PATH = path.resolve(__dirname, "solicitacoes.json");

// Carrega o banco ou cria um vazio
let dados = { pendentes: {} };
try {
    if (fs.existsSync(DB_PATH)) {
        dados = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    }
} catch (e) {
    console.error("Erro ao ler solicitacoes.json:", e);
}

function salvar() {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(dados, null, 2));
    } catch (e) {
        console.error("Erro ao salvar solicitacoes.json:", e);
    }
}

// Adiciona um pedido de entrada
function adicionar(grupoId, usuarioId) {
    if (!dados.pendentes[grupoId]) dados.pendentes[grupoId] = {};
    dados.pendentes[grupoId][usuarioId] = Date.now();
    salvar();
}

// Remove um pedido (aceito ou recusado)
function remover(grupoId, usuarioId) {
    if (dados.pendentes[grupoId] && dados.pendentes[grupoId][usuarioId]) {
        delete dados.pendentes[grupoId][usuarioId];
        salvar();
        return true;
    }
    return false;
}

// Verifica se o usuário tem pedido pendente no grupo
function temPendente(grupoId, usuarioId) {
    return Boolean(dados.pendentes[grupoId]?.[usuarioId]);
}

module.exports = { adicionar, remover, temPendente };