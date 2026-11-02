const fs = require("fs");
const path = require("path");
const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["backup", "salvarconfig"],
    description: "Envia um backup das configurações e bancos de dados para o dono",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const caminhosParaBackup = [
            "src/config",
            "src/database"
        ];

        // Arquivos que NÃO devem ir no backup (lixo, cache ou histórico)
        const ignorarArquivos = ["channel.json", "mutes.json", "session"];

        let textoBackup = "========== BACKUP RUNNER BOT ==========\n";
        textoBackup += `Data: ${new Date().toLocaleString("pt-BR")}\n\n`;

        try {
            for (const caminho of caminhosParaBackup) {
                const dir = path.join(process.cwd(), caminho);
                if (!fs.existsSync(dir)) continue;

                const arquivos = fs.readdirSync(dir);
                for (const arquivo of arquivos) {
                    if (!arquivo.endsWith(".json")) continue;
                    
                    // Pula os arquivos da lista de ignorados ou credenciais
                    if (ignorarArquivos.some(ignorar => arquivo.includes(ignorar))) continue;
                    if (arquivo.includes("creds")) continue;

                    const caminhoCompleto = path.join(dir, arquivo);
                    const stat = fs.statSync(caminhoCompleto);
                    
                    if (stat.isFile()) {
                        try {
                            const conteudo = fs.readFileSync(caminhoCompleto, "utf8");
                            // Tenta formatar o JSON para ficar bonito, se falhar joga o texto puro
                            let conteudoFormatado = conteudo;
                            try {
                                conteudoFormatado = JSON.stringify(JSON.parse(conteudo), null, 2);
                            } catch (_) {}

                            textoBackup += `========== ARQUIVO: ${caminho}/${arquivo} ==========\n`;
                            textoBackup += `${conteudoFormatado}\n\n`;
                        } catch (e) {
                            textoBackup += `========== ERRO AO LER: ${caminho}/${arquivo} ==========\n\n`;
                        }
                    }
                }
            }

            const buffer = Buffer.from(textoBackup, "utf8");

            // Envia como documento de texto para o privado do dono
            await ctx.sock.sendMessage(ctx.sender, {
                document: buffer,
                mimetype: "text/plain",
                fileName: `backup-runner-${Date.now()}.txt`,
                caption: "📦 *Backup de Configurações*\n\nBaixe o arquivo .txt e abra no Bloco de Notas do celular para ver seus dados salvos (VIPs, aluguéis, donos, etc)."
            });

            await ctx.replyNYX("✅ Backup enviado para o seu privado!", "bot");

        } catch (erro) {
            console.error("Erro ao gerar backup:", erro);
            await ctx.replyNYX("❌ Ocorreu um erro ao gerar o backup. Verifique os logs.", "bot");
        }
    }
};