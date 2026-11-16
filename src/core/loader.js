const fs = require("fs");
const path = require("path");

const comandos = new Map();

function carregarComandos() {
    comandos.clear();
    const pasta = path.join(__dirname, "../commands");
    const categorias = fs.readdirSync(pasta);

    for (const categoria of categorias) {
        const caminho = path.join(pasta, categoria);
        if (!fs.statSync(caminho).isDirectory()) continue;

        const arquivos = fs.readdirSync(caminho).filter(arq => arq.endsWith(".js"));
        for (const arquivo of arquivos) {
            const caminhoArquivo = path.join(caminho, arquivo);
            
            if (require.cache[require.resolve(caminhoArquivo)]) {
                delete require.cache[require.resolve(caminhoArquivo)];
            }

            try {
                // O TRY/CATCH AQUI SALVA O BOT DE CRASH
                const comando = require(caminhoArquivo);
                
                if (comando && typeof comando === "object" && !comando.category) {
                    comando.category = categoria;
                }

                if (Array.isArray(comando.name)) {
                    for (const nome of comando.name) {
                        comandos.set(nome, comando);
                    }
                } else if (comando.name) {
                    comandos.set(comando.name, comando);
                }
            } catch (error) {
                console.error(`\n[ERRO NO COMANDO] Falha ao carregar ${arquivo}:`, error.message, "\n");
            }
        }
    }
    return comandos.size;
}

carregarComandos();
comandos.reload = carregarComandos;
module.exports = comandos;
