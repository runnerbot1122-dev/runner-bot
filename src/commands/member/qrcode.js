const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const QRCode = require("qrcode");

module.exports = {
    name: ["qrcode", "qr"],
    description: "Gera um QR Code de um texto ou link",
    execute: async (ctx) => {
        const texto = ctx.args.join(" ");
        if (!texto) {
            return replyNYX(ctx, `📱 *QR CODE*\n\nUso: *${ctx.prefix}qrcode <texto ou link>*`, "bot");
        }

        try { await ctx.react("⚡"); } catch (e) {}

        try {
            const buffer = await QRCode.toBuffer(texto, { 
                width: 512,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' }
            });

            await sendNYXMedia(ctx.sock, ctx.chat, { 
                image: buffer, 
                caption: `✅ *QR Code gerado!*\n\n📌 Texto: ${texto}` 
            }, ctx.message);

        } catch (error) {
            console.error("[QRCODE] Erro:", error.message);
            await replyNYX(ctx, "❌ Erro ao gerar o QR Code.", "bot");
        }
    }
};