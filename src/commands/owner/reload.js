const replyNYX = require("../../utils/replyNYX");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: ["reload", "recarregar"],
    description: "Recarrega os comandos sem reiniciar o bot",
    execute: async (ctx) => {
        if (!ctx.isOwner && !ctx.isMaster) {
            return replyNYX(ctx, "❌ Apenas o dono pode usar este comando.", "bot");
        }

        try {
            await ctx.react("⚡");
            
            const loaderPath = require.resolve("../../core/loader");
            const comandos = require(loaderPath);
            
            // Limpa o cache de TODOS os arquivos dentro da pasta commands
            const limparCache = (dir) => {
                const arquivos = fs.readdirSync(dir);
                for (const arquivo of arquivos) {
                    const caminho = path.join(dir, arquivo);
                    if (fs.statSync(caminho).isDirectory()) {
                        limparCache(caminho);
                    } else if (arquivo.endsWith(".js")) {
                        if (require.cache[require.resolve(caminho)]) {
                            delete require.cache[require.resolve(caminho)];
                        }
                    }
                }
            };
            
            limparCache(path.join(process.cwd(), "src", "commands"));

            let total = 0;
            // Se o loader tiver a função, usa
            if (typeof comandos.reload === "function") {
                total = comandos.reload();
            } else {
                // Se não tiver, ele mesmo limpa o Map e repopula
                if (typeof comandos.clear === "function") comandos.clear();
                else for (let key in comandos) delete comandos[key];

                const pasta = path.join(process.cwd(), "src", "commands");
                const pastas = fs.readdirSync(pasta);
                
                for (const p of pastas) {
                    const caminhoPasta = path.join(pasta, p);
                    if (!fs.statSync(caminhoPasta).isDirectory()) continue;
                    
                    const arquivos = fs.readdirSync(caminhoPasta).filter(a => a.endsWith(".js"));
                    for (const a of arquivos) {
                        const cmd = require(path.join(caminhoPasta, a));
                        if (cmd.category === undefined) cmd.category = p;
                        const nomes = Array.isArray(cmd.name) ? cmd.name : [cmd.name];
                        for (const n of nomes) {
                            if (n) {
                                if (typeof comandos.set === "function") comandos.set(n, cmd);
                                else comandos[n] = cmd;
                                total++;
                            }
                        }
                    }
                }
            }

            await replyNYX(ctx, `✅ *RELOAD CONCLUÍDO!*\n\n🔄 ${total} comandos carregados na memória.`, "bot");

        } catch (error) {
            console.error("[RELOAD] Erro:", error.message);
            await replyNYX(ctx, `❌ Erro ao recarregar: ${error.message}`, "bot");
        }
    }
};
