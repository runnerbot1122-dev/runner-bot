const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["getchannel", "getcanal"],
    description: "Obtém o link ou ID de um canal",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const linkCanal = ctx.args[0];
        if (!linkCanal || !linkCanal.includes("whatsapp.com/channel/")) {
            return ctx.replyNYX(`❌ Uso: \`${ctx.prefix}getchannel <link_do_canal>\``, "user");
        }

        try {
            // Extrai o código do canal
            const codigo = linkCanal.split("whatsapp.com/channel/")[1]?.split(/[\s?]/)[0];
            if (!codigo) throw new Error("Link inválido");

            await ctx.react("📡");
            
            // Tenta pegar a metadata do canal
            const metadata = await ctx.sock.newsletterMetadata("invite", codigo);
            
            if (!metadata) {
                return ctx.replyNYX("❌ Canal não encontrado ou link expirado.", "bot");
            }

            return ctx.replyNYX(
                `📡 *Informações do Canal:*\n\n` +
                `📌 Nome: ${metadata.name}\n` +
                `🆔 ID: \`${metadata.id}\`\n` +
                `👥 Inscritos: ${metadata.subscriberCount || "Oculto"}\n` +
                `🔗 Link: https://whatsapp.com/channel/${metadata.invite}`,
                "bot"
            );

        } catch (error) {
            console.error("[GETCHANNEL] Erro:", error);
            return ctx.replyNYX("❌ Não consegui obter informações deste canal. Verifique o link.", "bot");
        }
    }
};