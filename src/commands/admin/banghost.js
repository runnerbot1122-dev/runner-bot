const { requireAdmin } = require("../../utils/checkPermission");

module.exports = {
    name: ["banghost"],
    description: "Remove membros que não possuem conta válida no WhatsApp",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        await ctx.replyNYX("⏳ Verificando contas fantasmas...", "bot");
        const metadata = await ctx.sock.groupMetadata(ctx.chat);
        const botJid = ctx.sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
        
        let removidos = 0;
        for (const p of metadata.participants) {
            const id = p.id || p.jid;
            if (!id || id === botJid || p.admin) continue;

            try {
                const [check] = await ctx.sock.onWhatsApp(id);
                if (!check || !check.exists) {
                    await ctx.sock.groupParticipantsUpdate(ctx.chat, [id], "remove");
                    removidos++;
                    await new Promise(r => setTimeout(r, 1000));
                }
            } catch (_) {}
        }
        await ctx.replyNYX(`✅ ${removidos} fantasmas removidos.`, "bot");
    }
};