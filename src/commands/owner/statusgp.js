const ownerOnly = require("../../utils/ownerOnly");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: ["statusgp", "statusgrupo"],
    description: "Posta um texto ou mídia no status do grupo",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.replyNYX("❌ Use este comando dentro do grupo que deseja postar o status.", "user");

        // 1. Verifica se o usuário respondeu a uma mídia (vídeo/imagem)
        const quoted = ctx.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const texto = ctx.args.join(" ").trim();

        try {
            // CASO 1: Postar MÍDIA (Imagem ou Vídeo) respondida
            if (quoted && (quoted.imageMessage || quoted.videoMessage)) {
                const tipoMidia = quoted.imageMessage ? "image" : "video";
                
                await ctx.replyNYX(`⏳ Baixando e postando ${tipoMidia === "image" ? "imagem" : "vídeo"} no status...`, "bot");

                // Baixa o buffer da mídia
                const buffer = await downloadMediaMessage(
                    { message: quoted },
                    "buffer",
                    {},
                    { logger: console }
                );

                // Legenda opcional (se a pessoa digitou algo junto com o comando)
                const legenda = texto || undefined;

                // Envia para o status (Stories)
                // O status é enviado para o próprio JID com a flag de status
                await ctx.sock.sendMessage(ctx.chat, {
                    [tipoMidia]: buffer,
                    caption: legenda
                }, { statusJidList: [ctx.chat] }); // Envia como status para o grupo

                return ctx.replyNYX(`✅ ${tipoMidia === "image" ? "Imagem" : "Vídeo"} postado no status do grupo com sucesso!`, "bot");
            }

            // CASO 2: Postar apenas TEXTO
            if (texto) {
                await ctx.sock.sendMessage(ctx.chat, {
                    text: texto,
                    backgroundColor: "#000000", // Cor de fundo do texto no status
                    font: 1 // Fonte padrão
                }, { statusJidList: [ctx.chat] });

                return ctx.replyNYX("✅ Texto postado no status do grupo com sucesso!", "user");
            }

            // Se não passou texto nem respondeu mídia
            return ctx.replyNYX(
                `⚙️ *Uso do StatusGP:*\n\n` +
                `📝 Texto: \`${ctx.prefix}statusgp Sua mensagem aqui\`\n` +
                `🖼️ Imagem/Vídeo: Responda a uma mídia com \`${ctx.prefix}statusgp\` (pode colocar legenda depois)`,
                "bot"
            );

        } catch (error) {
            console.error("[STATUSGP] Erro:", error);
            return ctx.replyNYX("❌ Não consegui postar no status. Verifique se o bot tem permissão ou tente novamente.", "bot");
        }
    }
};