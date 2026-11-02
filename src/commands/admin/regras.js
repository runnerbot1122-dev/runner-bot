module.exports = {
    name: "regras",
    description: "Consulta as regras definidas na descrição do grupo",

    execute: async (ctx) => {
        if (!ctx.isGroup) {
            return ctx.reply("❌ Este comando só pode ser usado em grupos.");
        }

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.chat);
            const descricao = metadata?.desc;

            if (typeof descricao !== "string" || !descricao.trim()) {
                return ctx.reply("📋 Este grupo ainda não tem regras definidas na descrição.");
            }

            return ctx.reply(descricao);
        } catch {
            return ctx.reply("❌ Não foi possível consultar as regras do grupo neste momento.");
        }
    }
};
