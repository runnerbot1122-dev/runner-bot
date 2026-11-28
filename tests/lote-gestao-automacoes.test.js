const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const groupsPath = path.join(root, "src/database/storage/groups.json");
const tasksPath = path.join(root, "src/database/storage/scheduledTasks.json");

function withDatabaseSnapshot(file, callback) {
    const original = fs.readFileSync(file, "utf8");
    try {
        return callback();
    } finally {
        fs.writeFileSync(file, original);
    }
}

test("respostas automáticas podem ser ativadas, desativadas e editadas", () => {
    withDatabaseSnapshot(groupsPath, () => {
        const groups = require(path.join(root, "src/utils/groups"));
        const manager = require(path.join(root, "src/core/autoReplyManager"));
        const id = "test-gestao@g.us";
        const respostas = groups.getAutoReplies(id, false);
        respostas.splice(0, respostas.length);

        groups.addAutoReply(id, "bom dia", "Bom dia!");
        assert.equal(manager.findAutomaticReplies(id, "bom dia agora").length, 1);

        const pausada = groups.setAutoReplyEnabled(id, "bom dia", false);
        assert.equal(pausada.enabled, false);
        assert.equal(manager.findAutomaticReplies(id, "bom dia agora").length, 0);

        const editada = groups.updateAutoReply(id, "bom dia", "boa tarde", "Boa tarde!");
        assert.equal(editada.trigger, "boa tarde");
        groups.setAutoReplyEnabled(id, "boa tarde", true);
        assert.deepEqual(manager.findAutomaticReplies(id, "boa tarde"), [
            { trigger: "boa tarde", response: "Boa tarde!" }
        ]);
    });
});

test("respostas antigas sem enabled continuam funcionando", () => {
    withDatabaseSnapshot(groupsPath, () => {
        const groups = require(path.join(root, "src/utils/groups"));
        const manager = require(path.join(root, "src/core/autoReplyManager"));
        const id = "test-compatibilidade@g.us";
        const respostas = groups.getAutoReplies(id, false);
        respostas.splice(0, respostas.length, { trigger: "legado", response: "Funcionando" });
        assert.equal(manager.findAutomaticReplies(id, "legado").length, 1);
    });
});

test("loader registra todos os aliases novos", () => {
    const loader = require(path.join(root, "src/core/loader"));
    const aliases = [
        "lembrete", "lembrar", "timer",
        "listarrespostas", "listarespostas",
        "testarresposta", "testarrespostas",
        "ativarresposta", "ativarrespostas", "ligarresposta",
        "desativarresposta", "desativarrespostas", "desligarresposta",
        "editarresposta", "editarrespostas", "editresposta"
    ];
    for (const alias of aliases) assert.ok(loader.get(alias), `alias ausente: ${alias}`);
});

test("reação personalizada impede a reação genérica posterior", async () => {
    const { applyCommandSuccessReaction } = require(path.join(root, "src/core/reactionManager"));
    let chamadas = 0;
    const resultado = await applyCommandSuccessReaction({
        command: "play",
        customReactionSent: true,
        sock: { sendMessage: async () => { chamadas++; } },
        chat: "teste@g.us",
        message: { key: { id: "1" } }
    });
    assert.equal(resultado, false);
    assert.equal(chamadas, 0);
});

test("scheduler restaura tarefas persistidas em um novo processo", () => {
    withDatabaseSnapshot(tasksPath, () => {
        const id = "lm-test-restart";
        fs.writeFileSync(tasksPath, JSON.stringify({
            [id]: {
                id,
                chat: "restart@g.us",
                sender: "5511999999999@s.whatsapp.net",
                text: "teste de reinicialização",
                dueAt: Date.now() + 60000,
                nextAttemptAt: Date.now() + 60000,
                status: "pending",
                attempts: 0
            }
        }, null, 4));
        const child = spawnSync(process.execPath, ["-e", `
            const scheduler = require(${JSON.stringify(path.join(root, "src/core/scheduler"))});
            const stats = scheduler.getStats();
            if (stats.pending !== 1) process.exit(2);
            console.log("scheduler-restart-ok");
            process.exit(0);
        `], { cwd: root, encoding: "utf8", timeout: 5000 });
        assert.equal(child.status, 0, child.stderr || child.stdout);
        assert.match(child.stdout, /scheduler-restart-ok/);
    });
});


test("respostas automáticas respeitam prioridade e cooldown apenas na execução real", async () => {
    const original = fs.readFileSync(groupsPath, "utf8");
    try {
        const groups = require(path.join(root, "src/utils/groups"));
        const manager = require(path.join(root, "src/core/autoReplyManager"));
        const id = "test-prioridade@g.us";
        const respostas = groups.getAutoReplies(id, false);
        respostas.splice(0, respostas.length);
        groups.addAutoReply(id, "oi", "resposta baixa");
        groups.addAutoReply(id, "oi tudo", "resposta alta");
        groups.setAutoReplyOptions(id, "oi", { priority: 1, cooldownMs: 60000 });
        groups.setAutoReplyOptions(id, "oi tudo", { priority: 10, cooldownMs: 60000 });
        assert.deepEqual(manager.findAutomaticReplies(id, "oi tudo", { respectCooldown: false }).map(item => item.response), ["resposta alta", "resposta baixa"]);
        manager.clearCooldowns();
        let envios = 0;
        await manager.applyAutomaticReplies({
            chat: id,
            sender: "5511999999999@s.whatsapp.net",
            message: { message: {}, key: { id: "test" } },
            sock: {
                sendMessage: async () => { envios++; },
                relayMessage: async () => { envios++; }
            }
        }, "oi tudo");
        assert.equal(envios, 2);
        assert.equal(manager.findAutomaticReplies(id, "oi tudo", { respectCooldown: true }).length, 0);
        assert.equal(manager.findAutomaticReplies(id, "oi tudo", { respectCooldown: false }).length, 2);
        manager.clearCooldowns();
    } finally {
        fs.writeFileSync(groupsPath, original);
    }
});

test("scheduler lista, cancela e limpa lembretes por grupo", () => {
    withDatabaseSnapshot(tasksPath, () => {
        const scheduler = require(path.join(root, "src/core/scheduler"));
        const chat = "120363000000000000@g.us";
        const sender = "5511999999999@s.whatsapp.net";
        const contexto = { chat, sender, isAdmin: true, isOwner: false };
        const primeiro = scheduler.createTask({ chat, sender, text: "primeiro", delayMs: 60000 });
        const segundo = scheduler.createTask({ chat, sender, text: "segundo", delayMs: 120000 });
        assert.equal(scheduler.listChatTasks(chat).length, 2);
        assert.equal(scheduler.cancelTask(primeiro.id, contexto).found, true);
        assert.equal(scheduler.listChatTasks(chat).length, 1);
        assert.equal(scheduler.cancelTasksForChat(chat, contexto).length, 1);
        assert.equal(scheduler.listChatTasks(chat).length, 0);
        assert.equal(scheduler.cancelTask(segundo.id, contexto).found, false);
    });
});

test("auditoria detecta identidade inválida e referências inconsistentes", () => {
    const { auditar } = require(path.join(root, "scripts/auditar-identidades.js"));
    const problemas = auditar({
        users: { "5511": { jid: "5511@s.whatsapp.net" } },
        groups: {},
        scheduledTasks: {
            "lm-1": { id: "lm-2", chat: "120363000000000000-123@g.us", sender: "5511999999999@lid" }
        }
    });
    assert.ok(problemas.some(item => item.mensagem.includes("chave inválida")));
    assert.ok(problemas.some(item => item.mensagem.includes("grupo ausente")));
    assert.ok(problemas.some(item => item.mensagem.includes("identidade ausente")));
});

test("menus não exibem entradas removidas e exibem o gerenciamento novo", () => {
    const admin = require(path.join(root, "src/utils/menus/admin"))("7");
    const brincadeiras = require(path.join(root, "src/utils/menus/brincadeiras"))("7");
    const principal = require(path.join(root, "src/utils/menus/principal"))("7");
    for (const entrada of ["7bemvindo2", "7legendabv2", "7legendasaiu2", "7mencionar", "7sobrenome", "7historia", "7attp2", "7attp_white", "7attp_brat", "7apex", "7morechat"]) {
        assert.equal(admin.includes(entrada) || brincadeiras.includes(entrada) || principal.includes(entrada), false, `entrada inválida: ${entrada}`);
    }
    assert.match(admin, /7configresposta/);
    assert.match(admin, /7lembretesgrupo/);
});

test("reações globais não competem com comandos prefixados", () => {
    const { isPrefixCommand } = require(path.join(root, "src/core/reactionManager"));
    assert.equal(isPrefixCommand("7play música", ["7"]), true);
    assert.equal(isPrefixCommand("oi 7play", ["7"]), false);
});

test("loader registra os aliases de configuração e lembretes administrativos", () => {
    const loader = require(path.join(root, "src/core/loader"));
    for (const alias of ["configresposta", "configurarresposta", "lembretesgrupo", "listarlembretes", "cancelarlembrete", "removerlembrete", "limparlembretes"]) {
        assert.ok(loader.get(alias), `alias ausente: ${alias}`);
    }
});


test("não existem aliases duplicados entre arquivos de comandos", () => {
    const fs = require("node:fs");
    const path = require("node:path");
    const comandosDir = path.join(root, "src", "commands");
    const aliases = new Map();
    for (const categoria of fs.readdirSync(comandosDir)) {
        const pasta = path.join(comandosDir, categoria);
        if (!fs.statSync(pasta).isDirectory()) continue;
        for (const arquivo of fs.readdirSync(pasta).filter(nome => nome.endsWith(".js"))) {
            const caminho = path.join(pasta, arquivo);
            const comando = require(caminho);
            const nomes = Array.isArray(comando?.name) ? comando.name : [comando?.name];
            for (const nome of nomes.filter(Boolean)) {
                const alias = String(nome).trim().toLowerCase();
                assert.equal(aliases.has(alias), false, `alias duplicado: ${alias} (${aliases.get(alias)} e ${caminho})`);
                aliases.set(alias, caminho);
            }
        }
    }
});

test("aliases históricos continuam apontando para implementações distintas", () => {
    const loader = require(path.join(root, "src/core/loader"));
    assert.equal(loader.get("signo").description, "Descobre o signo baseado na data");
    assert.equal(loader.get("meusigno").description, "Descobre o signo do usuário baseado no registro");
    assert.equal(loader.get("sorte").description, "Escolhe uma opção aleatória");
    assert.equal(loader.get("chance").description, "Calcula a chance de algo dar certo");
    assert.equal(loader.get("sorteio").description, "Sorteia um membro do grupo");
    assert.equal(loader.get("sortear").description, "Sorteia um membro do grupo");
});
