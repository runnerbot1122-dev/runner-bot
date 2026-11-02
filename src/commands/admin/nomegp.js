const {
    requireAdmin
} = require("../../utils/checkPermission");

module.exports = {
    name: "nomegp",
    description: "Consulta ou altera o nome do grupo",

    execute: async (ctx) => {
        if (!ctx.isGroup) {
            return ctx.reply("❌ Este comando só pode ser usado em grupos.");
        }

        const args = Array.isArray(ctx.args) ? ctx.args : [];

        if (args.length === 0) {
            try {
                const metadata = await ctx.sock.groupMetadata(ctx.chat);
                return ctx.reply(`📛 Nome atual do grupo: ${metadata.subject || "Sem nome"}`);
            } catch {
                return ctx.reply("❌ Não consegui consultar o nome do grupo agora.");
            }
        }

        const novoNome = args.join(" ").trim();

        if (!novoNome) {
            return ctx.reply("❌ O nome do grupo não pode ficar vazio.");
        }

        requireAdmin(ctx);

        try {
            await ctx.sock.groupUpdateSubject(ctx.chat, novoNome);
        } catch {
            return ctx.reply(
                "❌ A plataforma recusou ou não concluiu a alteração. Verifique se o bot tem permissão para alterar o nome do grupo e tente novamente."
            );
        }

        return ctx.reply(`✅ Nome do grupo atualizado para: ${novoNome}`);
    }
};
