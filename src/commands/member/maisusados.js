const fs = require("fs");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["maisusados", "topcomandos"],
    description: "Mostra os 3 comandos mais usados no grupo",
    execute: async (ctx) => {
        if (!ctx.isGroup) return replyNYX(ctx, "❌ Apenas grupos.", "user");

        const logFile = path.join(process.cwd(), "logs", "commands.log");
        
        if (!fs.existsSync(logFile)) {
            return replyNYX(ctx, "📊 Nenhum comando registrado no bot ainda.", "bot");
        }

        try {
            const conteudo = fs.readFileSync(logFile, "utf8");
            // Separa os registros por causa da linha de "===================="
            const blocos = conteudo.split("====================");
            
            const contagem = {};

            for (const bloco of blocos) {
                if (!bloco.trim()) continue;

                const linhas = bloco.split("\n").map(l => l.trim());
                let cmd = null;
                let chat = null;

                for (let i = 0; i < linhas.length; i++) {
                    if (linhas[i] === "COMANDO:") cmd = linhas[i + 1];
                    if (linhas[i] === "CHAT:") chat = linhas[i + 1];
                }

                // Se o comando foi usado neste grupo, conta +1
                if (cmd && chat && chat === ctx.chat) {
                    contagem[cmd] = (contagem[cmd] || 0) + 1;
                }
            }

            const lista = Object.entries(contagem).map(([comando, qtd]) => ({ comando, qtd }));
            lista.sort((a, b) => b.qtd - a.qtd);
            const top = lista.slice(0, 3);

            let texto = `╔═━✰『 ᴛᴏᴘ ᴄᴏᴍᴀɴᴅᴏs 』═━✰\n\n`;

            if (top.length === 0) {
                texto += `║╎⊹ ࣪ ˖ ⚠️ ▸ Nenhum comando registrado neste grupo ainda.\n\n`;
            } else {
                top.forEach((item, index) => {
                    texto += `║╎⊹ ࣪ ˖ ${index + 1}º ▸ *${ctx.prefix}${item.comando}*\n`;
                    texto += `║╎⊹ ࣪ ˖ 📊 ▸ Usado *${item.qtd}* vez(es)\n\n`;
                });
            }

            texto += `╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            await replyNYX(ctx, texto, "bot");

        } catch (error) {
            console.error("[MAISUSADOS] Erro:", error.message);
            await replyNYX(ctx, "❌ Não consegui ler os registros.", "bot");
        }
    }
};