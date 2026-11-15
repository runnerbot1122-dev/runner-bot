const fs = require("fs");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["reload", "recarregar"],
    description: "Recarrega os comandos sem reiniciar o bot",
    execute: async (ctx) => {
        // Apenas o dono pode usar
        if (!ctx.isOwner && !ctx.isMaster) {
            return replyNYX(ctx, "❌ Apenas o dono pode usar este comando.", "bot");
        }

        try {
            await ctx.react("🔄");

            const commandsPath = path.join(process.cwd(), "src", "commands");
            const loaderPath = path.join(process.cwd(), "src", "core", "loader.js");
            const runnerPath = path.join(process.cwd(), "src", "core", "commandRunner.js");

            let count = 0;

            // Função para limpar o cache de um arquivo
            const clearCache = (filePath) => {
                if (fs.existsSync(filePath)) {
                    delete require.cache[require.resolve(filePath)];
                    count++;
                }
            };

            // Limpa o cache de todos os arquivos .js dentro da pasta de comandos
            const getAllFiles = (dir) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        getAllFiles(fullPath);
                    } else if (file.endsWith(".js")) {
                        clearCache(fullPath);
                    }
                }
            };

            getAllFiles(commandsPath);
            
            // Limpa o cache do loader e do runner
            clearCache(loaderPath);
            clearCache(runnerPath);

            // Dá um pequeno delay para garantir que o processo de limpeza terminou
            setTimeout(async () => {
                await replyNYX(ctx, `✅ *RELOAD CONCLUÍDO!*\n\n🔄 ${count} arquivos recarregados com sucesso.\n📡 O bot já está usando as versões mais recentes.`, "bot");
            }, 500);

        } catch (error) {
            console.error("[RELOAD] Erro:", error.message);
            await replyNYX(ctx, `❌ Erro ao recarregar: ${error.message}`, "bot");
        }
    }
};