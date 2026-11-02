const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["listaadmins", "admins", "adms"],
    description: "Lista todos os administradores do grupo",
    category: "admin",
    adminOnly: true,
    async execute(ctx) {
        const { sock, chat, isGroup } = ctx;

        if (!isGroup) {
            return replyNYX(ctx, "❌ Este comando só pode ser usado em grupos.", "user");
        }

        try {
            const metadata = await sock.groupMetadata(chat);
            const admins = metadata.participants.filter(p => p.admin === "admin" || p.admin === "superadmin");
            const dono = metadata.participants.find(p => p.admin === "superadmin");

            if (admins.length === 0) {
                return replyNYX(ctx, "⚠️ Este grupo não possui administradores.", "user");
            }

            let texto = `╔═━✰『 ʟɪsᴛᴀ ᴅᴇ ᴀᴅᴍɪɴs 』═━✰\n\n`;
            texto += `║╎⊹ ࣪ ˖ 👥 ▸ ᴛᴏᴛᴀʟ: *${admins.length}*\n`;
            texto += `║╎⊹ ࣪ ˖ 👑 ▸ ᴄʀɪᴀᴅᴏʀ: *${dono ? '1' : '0'}*\n`;
            texto += `║╰━━━━──────━━━━╯\n\n`;

            admins.forEach((adm) => {
                const isDono = dono && adm.id === dono.id;
                const cargo = isDono ? "Criador" : "Admin";
                const numero = adm.id.split("@")[0];
                
                texto += `║╎⊹ ࣪ ˖ ${isDono ? '👑' : '🛡️'} ▸ @${numero}\n`;
                texto += `║╎⊹ ࣪ ˖ 💼 ▸ _${cargo}_\n\n`;
            });

            texto += `╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            const mentions = admins.map(a => a.id);

            // A MÁGICA ACONTECE AQUI: Mandando um OBJETO com text e mentions!
            await replyNYX(ctx, { text: texto, mentions: mentions }, "bot");

        } catch (e) {
            console.error("[LISTAADMINS] Erro:", e);
            return replyNYX(ctx, "❌ Erro ao buscar administradores.", "bot");
        }
    }
};