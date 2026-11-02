const ownerOnly = require("../../utils/ownerOnly");
const path = require("path");

module.exports = {
    name: ["testepay", "tp"],
    description: "Envia o painel de pagamento falso visual",
    execute: async (ctx) => {
        ownerOnly(ctx);

        try {
            // Caminho da imagem que você salvou na pasta assets
            const caminhoImagem = path.resolve(__dirname, "../../../assets/cartao-pagamento.png");

            // O texto que vai ficar embaixo da imagem (igual ao print)
            const textoPainel = `*Pedido a mayoral 771*\n\n` +
                                `*ANTI-ROUBO*\n` +
                                `*GRUPO:* ${ctx.isGroup ? "GRUPO DE TESTE" : "PRIVADO"}\n\n` +
                                `@_ TENTOU PROMOVER @_ SEM PERMISSÃO.\n\n` +
                                `@_ FOI REBAIXADO.\n` +
                                `@_ FOI REBAIXADO.`;

            await ctx.sock.sendMessage(ctx.chat, {
                image: { url: caminhoImagem },
                caption: textoPainel,
                footer: "mayoral 771",
                headerType: 4,
                // Opcional: Adicionar botões embaixo da imagem
                buttons: [
                    {
                        buttonId: 'btn_ver_recibo',
                        buttonText: { displayText: '🧾 Ver Recibo' },
                        type: 1 
                    }
                ]
            });

            console.log("[TESTE-PAY] Imagem enviada.");

        } catch (erro) {
            console.error("[TESTE-PAY] Erro ao enviar:", erro.message);
            await ctx.replyNYX(`❌ Erro ao enviar a imagem. Verifique se ela está na pasta correta (src/assets/cartao-pagamento.png).\n\nErro: ${erro.message}`, "bot");
        }
    }
};