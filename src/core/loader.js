const fs = require("fs");
const path = require("path");

const comandos = new Map();

function carregarComandos() {
    const pasta = path.join(__dirname, "../commands");
    const categorias = fs.readdirSync(pasta);

    for (const categoria of categorias) {
        const caminho = path.join(pasta, categoria);
        
        if (!fs.statSync(caminho).isDirectory()) continue;

        const arquivos = fs.readdirSync(caminho).filter(arquivo => arquivo.endsWith(".js"));

        for (const arquivo of arquivos) {
            const caminhoCompleto = path.join(caminho, arquivo);
            
            // Se der erro de sintaxe, o bot quebra aqui e mostra no log
            const comando = require(caminhoCompleto);

            if (!comando || !comando.name) {
                console.log(`⚠️ ${arquivo} não tem 'name'`);
                continue;
            }

            if (!comando.category) {
                comando.category = categoria;
            }

            if (Array.isArray(comando.name)) {
                for (const nome of comando.name) {
                    comandos.set(nome.toLowerCase(), comando);
                }
            } else {
                comandos.set(comando.name.toLowerCase(), comando);
            }

            console.log(`Comando carregado: ${comando.name}`);
        }
    }
}

carregarComandos();

module.exports = comandos;
