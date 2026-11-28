#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const STORAGE = path.join(__dirname, "..", "src", "database", "storage");
const ARQUIVOS = {
    users: "users.json",
    groups: "groups.json",
    scheduledTasks: "scheduledTasks.json"
};

function normalizarIdentidade(valor) {
    if (typeof valor !== "string" || !valor.trim()) return null;
    const texto = valor.trim().toLowerCase();
    const partes = texto.split("@");
    if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
    return `${partes[0].split(":")[0]}@${partes[1]}`;
}

function tipoIdentidade(valor) {
    const id = normalizarIdentidade(valor);
    if (!id) return null;
    if (/^\d+@(s\.whatsapp\.net|c\.us|lid)$/.test(id)) return id.endsWith("@lid") ? "lid" : "jid";
    return null;
}

function lerBanco(nome) {
    const arquivo = path.join(STORAGE, ARQUIVOS[nome]);
    try {
        const dados = JSON.parse(fs.readFileSync(arquivo, "utf8"));
        if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
            throw new Error("a raiz precisa ser um objeto JSON");
        }
        return dados;
    } catch (erro) {
        throw new Error(`${ARQUIVOS[nome]}: ${erro.message}`);
    }
}

function adicionar(problemas, tipo, mensagem, detalhe) {
    problemas.push({ tipo, mensagem, detalhe });
}

function auditar(dados) {
    const problemas = [];
    const identidades = new Map();
    const users = dados.users;
    const groups = dados.groups;
    const tasks = dados.scheduledTasks;

    for (const [chave, usuario] of Object.entries(users)) {
        const chaveNormalizada = normalizarIdentidade(chave);
        const tipoChave = tipoIdentidade(chave);
        if (!tipoChave) {
            adicionar(problemas, "usuário", "chave inválida; esperada identidade JID/LID numérica", chave);
        } else {
            if (identidades.has(chaveNormalizada)) {
                adicionar(problemas, "duplicidade", "identidade de usuário duplicada após normalização", `${chave} e ${identidades.get(chaveNormalizada)}`);
            }
            identidades.set(chaveNormalizada, chave);
        }
        if (!usuario || typeof usuario !== "object" || Array.isArray(usuario)) {
            adicionar(problemas, "usuário", "registro não é um objeto", chave);
            continue;
        }
        for (const campo of ["jid", "lid"]) {
            if (usuario[campo] == null || usuario[campo] === "") continue;
            const valor = usuario[campo];
            const tipo = tipoIdentidade(valor);
            if (!tipo || (campo === "jid" && tipo !== "jid") || (campo === "lid" && tipo !== "lid")) {
                adicionar(problemas, "usuário", `${campo} inválido ou incompatível com o campo`, `${chave}: ${valor}`);
            }
            const normalizado = normalizarIdentidade(valor);
            if (normalizado && identidades.has(normalizado) && identidades.get(normalizado) !== chave) {
                adicionar(problemas, "duplicidade", "identidade referenciada por mais de um usuário", `${identidades.get(normalizado)} e ${chave}`);
            } else if (normalizado) {
                identidades.set(normalizado, chave);
            }
        }
    }

    for (const chave of Object.keys(groups)) {
        if (!/^\d+-\d+@g\.us$/i.test(String(chave).trim())) {
            adicionar(problemas, "grupo", "chave inválida; esperada identidade de grupo @g.us", chave);
        }
    }

    const identidadesConhecidas = new Set(identidades.keys());
    for (const [chave, tarefa] of Object.entries(tasks)) {
        if (!tarefa || typeof tarefa !== "object" || Array.isArray(tarefa)) {
            adicionar(problemas, "tarefa", "registro não é um objeto", chave);
            continue;
        }
        if (String(tarefa.id || "") !== chave) {
            adicionar(problemas, "tarefa", "id do registro não corresponde à chave do banco", `${chave} != ${tarefa.id}`);
        }
        if (!/^\d+-\d+@g\.us$/i.test(String(tarefa.chat || "").trim())) {
            adicionar(problemas, "tarefa", "chat inválido; esperada identidade @g.us", `${chave}: ${tarefa.chat}`);
        } else if (!Object.prototype.hasOwnProperty.call(groups, tarefa.chat)) {
            adicionar(problemas, "referência", "tarefa aponta para grupo ausente no banco de grupos", `${chave}: ${tarefa.chat}`);
        }
        const sender = normalizarIdentidade(tarefa.sender);
        if (!tipoIdentidade(tarefa.sender)) {
            adicionar(problemas, "tarefa", "sender inválido; esperada identidade JID/LID numérica", `${chave}: ${tarefa.sender}`);
        } else if (!identidadesConhecidas.has(sender)) {
            adicionar(problemas, "referência", "tarefa aponta para identidade ausente no banco de usuários", `${chave}: ${tarefa.sender}`);
        }
    }

    return problemas;
}

function main() {
    let dados;
    try {
        dados = Object.fromEntries(Object.keys(ARQUIVOS).map(nome => [nome, lerBanco(nome)]));
    } catch (erro) {
        console.error(`❌ Falha ao ler bancos: ${erro.message}`);
        return 2;
    }
    const problemas = auditar(dados);
    console.log("🔎 Auditoria de identidades e referências");
    console.log(`Usuários: ${Object.keys(dados.users).length} | Grupos: ${Object.keys(dados.groups).length} | Tarefas: ${Object.keys(dados.scheduledTasks).length}`);
    if (!problemas.length) {
        console.log("✅ Nenhum problema encontrado. Os bancos não foram alterados.");
        return 0;
    }
    console.error(`❌ ${problemas.length} problema(s) encontrado(s):`);
    for (const problema of problemas) console.error(`- [${problema.tipo}] ${problema.mensagem}: ${problema.detalhe}`);
    return 1;
}

if (require.main === module) process.exitCode = main();
module.exports = { auditar, lerBanco, normalizarIdentidade, tipoIdentidade };
