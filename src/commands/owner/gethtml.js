const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["gethtml"],
    description: "Baixa o código HTML de um site",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const url = ctx.args[0];
        if (!url || !url.startsWith("http")) {
            return ctx.replyNYX(`❌ Uso: \`${ctx.prefix}gethtml https://site.com\``, "user");
        }

        try {
            await ctx.react("⏳");
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            const buffer = Buffer.from(html, "utf8");

            await ctx.replyNYX("✅ HTML baixado:", "bot");

            // Envia como documento de texto
            await ctx.sock.sendMessage(ctx.chat, {
                document: buffer,
                mimetype: "text/html",
                fileName: `index_${Date.now()}.html`
            });

        } catch (error) {
            console.error("[GETHTML] Erro:", error);
            return ctx.replyNYX(`❌ Falha ao baixar o HTML: ${error.message}`, "bot");
        }
    }
};