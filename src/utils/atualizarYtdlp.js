const { execFile } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

async function atualizarYtdlp() {
    try {
        const bin = path.resolve(__dirname, "../../vendor/yt-dlp/linux-x64/yt-dlp");
        
        // Verifica se o binário existe
        if (!fs.existsSync(bin)) {
            console.log("[YT-DLP] Binário não encontrado no vendor. Pulando update automático.");
            return;
        }

        console.log("[YT-DLP] Verificando atualizações...");
        
        // O --update-to nightly baixa a versão mais recente (resolve bloqueios do YouTube)
        execFile(bin, ["-U", "--no-warnings"], { timeout: 15000 }, (erro, stdout, stderr) => {
            if (erro) {
                // Se der erro, tenta o canal nightly (mais atualizado e burla bloqueios)
                execFile(bin, ["--update-to", "nightly"], { timeout: 20000 }, (err2, out2) => {
                    if (err2) {
                        console.log("[YT-DLP] Não foi possível atualizar agora (mas pode continuar funcionando).");
                    } else {
                        console.log("[YT-DLP] ✅ Atualizado para o canal NIGHTLY com sucesso!");
                    }
                });
                return;
            }
            
            // Se disse que está atualizado
            if (stdout.includes("up to date") || stdout.includes("is up to date")) {
                console.log("[YT-DLP] ✅ Já está na versão mais recente.");
            } else {
                console.log("[YT-DLP] ✅ Atualizado com sucesso!");
            }
        });
    } catch (err) {
        console.log("[YT-DLP] Erro ao tentar atualizar:", err.message);
    }
}

module.exports = atualizarYtdlp;