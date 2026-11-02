const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["entrargp", "entrargrupo"],
    description: "Faz o bot entrar em um grupo via link",
    execute: async (ctx) => {
        ownerOnly(ctx);

        const link = ctx.args[0];
        if (!link || !link.includes("chat.whatsapp.com/")) {
            return ctx.replyNYX(`❌ Uso: \`${ctx.prefix}entrargp <link_do_grupo>\``, "user");
        }

        // Extrai o código do link
        const codigo = link.split("chat.whatsapp.com/")[1]?.split(/[\s?]/)[0];
        if (!codigo) {
            return ctx.replyNYX("❌ Link inválido.", "bot");
        }

        try {
            await ctx.react("⏳");
            const grupoId = await ctx.sock.groupAcceptInvite(codigo);
            
            return ctx.replyNYX(`✅ Entrei no grupo com sucesso!\n🆔 ID: \`${grupoId}\``, "bot");
        } catch (error) {
            console.error("[ENTRARGP] Erro:", error);
            // Se for porque o bot já está no grupo, o erro é 409
            if (error.message?.includes("409") || error.data === 409) {
                return ctx.replyNYX("ℹ️ O bot já está neste grupo.", "bot");
            }
            return ctx.replyNYX("❌ Não consegui entrar no grupo. O link pode ter expirado ou o bot foi banido.", "bot");
        }
    }
};