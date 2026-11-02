const { requireAdmin } = require("../../utils/checkPermission");

module.exports = {
    name: ["banfake"],
    description: "Remove números fakes/estrangeiros (ignora foto de perfil)",
    execute: async (ctx) => {
        requireAdmin(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

        await ctx.replyNYX("⏳ Analisando membros (apenas números)...", "bot");
        const metadata = await ctx.sock.groupMetadata(ctx.chat);
        
        const botJid = ctx.sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
        const criadorJid = metadata.owner;
        
        // 👈 CORREÇÃO: Filtro APENAS por número (DDI 55 e tamanho mínimo), SEM foto
        const suspeitos = metadata.participants.filter(p => {
            const id = p.id || p.jid;
            if (!id || id === botJid || id === criadorJid || p.admin) return false;
            
            // Pega só os dígitos do número
            const numero = id.split("@")[0].replace(/\D/g, "");

            // Regra 1: Se o número não começa com 55 (Brasil)
            if (!numero.startsWith("55")) return true;

            // Regra 2: Se for um número brasileiro com tamanho inválido (muito curto)
            // Um DDD + número no BR tem no mínimo 10 dígitos (ex: 11 99999-9999)
            if (numero.length < 10 || numero.length > 13) return true;

            return false;
        });

        if (suspeitos.length === 0) return ctx.replyNYX("✅ Nenhum número suspeito encontrado.", "bot");

        let removidos = 0;
        for (const fake of suspeitos) {
            try {
                await ctx.sock.groupParticipantsUpdate(ctx.chat, [fake.id], "remove");
                removidos++;
                await new Promise(r => setTimeout(r, 1000));
            } catch (_) {}
        }
        
        await ctx.replyNYX(`✅ Removidos ${removidos} número(s) suspeito(s).`, "bot");
    }
};