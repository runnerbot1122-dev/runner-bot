const { requireAdmin } = require("../../utils/checkPermission");

module.exports = {
    name: ["msgtemp"],
    description: "Define o tempo das mensagens temporárias (exige ephemeral ativo)",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        const tempo = ctx.args[0]?.toLowerCase(); 
        const temposValidos = { "24h": 86400, "7d": 604800, "90d": 7776000, "off": 0 };

        if (!tempo || !temposValidos[tempo]) {
            return ctx.replyNYX(`⚙️ Uso: \`${ctx.prefix}msgtemp 24h\`, \`7d\`, \`90d\` ou \`off\``, "bot");
        }

        try {
            // 👈 CORREÇÃO: Puxa a metadata para verificar o estado efêmero do grupo
            const metadata = await ctx.sock.groupMetadata(ctx.chat);
            const ephemeralAtivo = metadata.ephemeralDuration > 0;

            if (!ephemeralAtivo && tempo !== "off") {
                return ctx.replyNYX(
                    `⚠️ O modo *ephemeral* (mensagens temporárias) está DESATIVADO neste grupo.\n\n` +
                    `Use \`${ctx.prefix}ephemeral\` primeiro para ativar o modo padrão.`, 
                    "bot"
                );
            }

            await ctx.sock.groupToggleEphemeral(ctx.chat, temposValidos[tempo]);
            await ctx.replyNYX(
                tempo === "off" 
                    ? "✅ Mensagens temporárias definidas para OFF (desativadas)." 
                    : `✅ Tempo das mensagens temporárias definido para: ${tempo}.`, 
                "bot"
            );
        } catch (e) {
            console.error("[MSGTEMP] Erro:", e);
            await ctx.reply("❌ Não consegui alterar o tempo das mensagens.");
        }
    }
};