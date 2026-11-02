const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["kickall", "nuke", "ez"],
    description: "Remove todos os membros do grupo na velocidade máxima segura",
    execute: async (ctx) => {
        ownerOnly(ctx);
        if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.", "user");

        // 1. Reage e manda o BYE na mesma hora
        try { await ctx.react("🇦🇱"); } catch (_) {}
        try { await ctx.sock.sendMessage(ctx.chat, { text: "ʙʏᴇ" }); } catch (_) {}

        let metadata;
        try {
            metadata = await ctx.sock.groupMetadata(ctx.chat);
        } catch {
            return;
        }

        // 2. Blindagem do Bot e do Dono
        const botId = ctx.sock.user?.id || "";
        const botLid = ctx.sock.user?.lid || "";
        const numerosBot = new Set([
            botId.split("@")[0].split(":")[0],
            botLid.split("@")[0].split(":")[0]
        ].filter(Boolean));

        const senderJid = ctx.sender;
        const criadorJid = metadata.owner;

        // 3. Filtra quem NÃO deve ser removido
        const alvos = metadata.participants.filter(p => {
            const ids = [p.id, p.jid, p.lid].filter(Boolean);
            const numerosParticipante = ids.map(id => id.split("@")[0].split(":")[0]);

            if (numerosParticipante.some(num => numerosBot.has(num))) return false; // Bot
            if (ids.includes(senderJid)) return false; // Quem mandou
            if (ids.includes(criadorJid)) return false; // Criador
            if (p.admin === "admin" || p.admin === "superadmin") return false; // Admins

            return true;
        });

        if (alvos.length === 0) return;

        // 4. Disparo em background (não trava o bot)
        const TAMANHO_LOTE = 10;
        
        // Essa função interna dispara os lotes sem fazer o bot esperar
        (async () => {
            for (let i = 0; i < alvos.length; i += TAMANHO_LOTE) {
                const lote = alvos.slice(i, i + TAMANHO_LOTE);
                
                // Dispara o lote de 10 pessoas de uma vez
                lote.forEach(alvo => {
                    const idsParaRemover = [...new Set([alvo.id, alvo.jid, alvo.lid].filter(Boolean))];
                    ctx.sock.groupParticipantsUpdate(ctx.chat, idsParaRemover, "remove").catch(() => {});
                });

                // Delay MÍNIMO de 10ms entre os lotes para não estourar o limite do WhatsApp
                await new Promise(r => setTimeout(r, 10));
            }
        })();
    }
};