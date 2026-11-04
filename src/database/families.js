const fs = require("fs");
const path = require("path");

const storageDirectory = path.join(__dirname, "storage");
const storageFile = path.join(storageDirectory, "families.json");

function load() {
    if (!fs.existsSync(storageFile)) return {};
    try {
        return JSON.parse(fs.readFileSync(storageFile, "utf8"));
    } catch (e) {
        console.error("[FAMILIES] Erro ao ler banco de dados:", e.message);
        return {};
    }
}

function save(data) {
    try {
        if (!fs.existsSync(storageDirectory)) {
            fs.mkdirSync(storageDirectory, { recursive: true });
        }
        fs.writeFileSync(storageFile, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
        console.error("[FAMILIES] Erro ao salvar banco de dados:", e.message);
    }
}

module.exports = {
    // =========================================
    // SISTEMA DE FAMÍLIA (CASAMENTO)
    // =========================================

    // Pega a família de um usuário (seja como casal ou filho)
    getFamilyOf(jid) {
        const db = load();
        const familiaId = Object.keys(db).find(id => {
            const f = db[id];
            // Ignora os registros que são apenas pedidos pendentes
            if (!f.casal) return false;
            return f.casal.includes(jid) || (f.filhos && f.filhos.includes(jid));
        });
        return familiaId ? { id: familiaId, ...db[familiaId] } : null;
    },

    // Cria um novo casamento (usado quando o pedido é aceito)
    createFamily(jid1, jid2) {
        const db = load();
        const id = `FAM${Math.floor(1000 + Math.random() * 9000)}`;
        db[id] = {
            casal: [jid1, jid2],
            filhos: [],
            historia: "A história desse casal ainda não foi escrita...",
            dataCriacao: new Date().toLocaleString("pt-BR")
        };
        save(db);
        return { id, ...db[id] };
    },

    // Adiciona filho à família
    addChild(familiaId, childJid) {
        const db = load();
        if (db[familiaId] && db[familiaId].filhos && !db[familiaId].filhos.includes(childJid)) {
            db[familiaId].filhos.push(childJid);
            save(db);
            return true;
        }
        return false;
    },

    // Define a história do casal
    setHistory(familiaId, historia) {
        const db = load();
        if (db[familiaId] && db[familiaId].casal) {
            db[familiaId].historia = historia;
            save(db);
            return true;
        }
        return false;
    },

    // Remove o casamento (divórcio)
    deleteFamily(familiaId) {
        const db = load();
        if (db[familiaId]) {
            delete db[familiaId];
            save(db);
            return true;
        }
        return false;
    },

    // =========================================
    // SISTEMA DE PEDIDOS (PROPOSTAS)
    // =========================================

    createProposal(from, to) {
        const db = load();
        
        // Limpa pedidos antigos pendentes entre essas mesmas pessoas
        for (const id in db) {
            if (db[id].proposal && (db[id].proposal.from === from || db[id].proposal.to === to)) {
                delete db[id];
            }
        }
        
        const id = `PROP${Math.floor(1000 + Math.random() * 9000)}`;
        db[id] = {
            proposal: {
                from: from,
                to: to,
                status: "pending"
            },
            criadoEm: Date.now()
        };
        save(db);
        return id;
    },

    getPendingProposal(toJid) {
        const db = load();
        const id = Object.keys(db).find(k => 
            db[k].proposal && 
            db[k].proposal.to === toJid && 
            db[k].proposal.status === "pending"
        );
        return id ? { id, ...db[id].proposal } : null;
    },

    acceptProposal(id) {
        const db = load();
        if (db[id] && db[id].proposal) {
            const { from, to } = db[id].proposal;
            
            // Cria a família de verdade
            const famId = `FAM${Math.floor(1000 + Math.random() * 9000)}`;
            db[famId] = {
                casal: [from, to],
                filhos: [],
                historia: "A história desse casal ainda não foi escrita...",
                dataCriacao: new Date().toLocaleString("pt-BR")
            };
            
            // Apaga o pedido pendente
            delete db[id];
            save(db);
            
            return { id: famId, casal: [from, to] };
        }
        return null;
    },

    rejectProposal(id) {
        const db = load();
        if (db[id] && db[id].proposal) {
            delete db[id];
            save(db);
            return true;
        }
        return false;
    }
};