const ownerOnly = require("../../utils/ownerOnly");
const fs = require("fs");
const path = require("path");
const config = require("../../config/config");

module.exports = {
    name: ["prefixo", "prefixglobal"],
    description: "Altera o prefixo globalmente e em todos os grupos",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const novoPrefixo = ctx.args[0];
        if (!novoPrefixo || novoPrefixo.length > 3) {
            return ctx.replyNYX(`❌ Uso: \`${ctx.prefix}prefixo <símbolo>\` (ex: !, /, #)`, "user");
        }

        try {
            // 1. Altera no config.js em memória
            config.prefix = novoPrefixo;

            // 2. Altera no arquivo config.js físico (se existir e for um objeto exportado)
            const configPath = path.resolve(__dirname, "../../config/config.js");
            if (fs.existsSync(configPath)) {
                let configContent = fs.readFileSync(configPath, "utf8");
                // Substitui a linha que define o prefixo (regex segura)
                configContent = configContent.replace(/prefix\s*:\s*["'].*?["']/g, `prefix: "${novoPrefixo}"`);
                fs.writeFileSync(configPath, configContent, "utf8");
            }

            // 3. Atualiza em TODOS os grupos no banco de dados
            const database = require("../../database/database");
            if (database.groups) {
                for (const grupoId in database.groups) {
                    if (!database.groups[grupoId].settings) database.groups[grupoId].settings = {};
                    database.groups[grupoId].settings.prefix = novoPrefixo;
                }
                if (typeof database.saveGroups === "function") database.saveGroups();
            }

            // Reage com emoji e responde
            await ctx.react("🏴‍☠️");
            return ctx.replyNYX(`✅ Prefixo global alterado para: *${novoPrefixo}*`, "bot");

        } catch (error) {
            console.error("[PREFIXO] Erro:", error);
            return ctx.replyNYX("❌ Erro ao tentar salvar o novo prefixo.", "bot");
        }
    }
};