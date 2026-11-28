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
