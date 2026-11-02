const { requireAdmin } = require("../../utils/checkPermission");

module.exports = {
    name: "descgp",
    description: "Consulta ou altera a descrição do grupo",

    execute: async (ctx) => {
        if (!ctx.isGroup) {
            return ctx.reply("❌ Este comando só pode ser usado em grupos.");
        }

        const args = Array.isArray(ctx.args) ? ctx.args : [];

        if (args.length === 0) {
            try {
                const metadata = await ctx.sock.groupMetadata(ctx.chat);
                const descricao =
                    typeof metadata?.desc === "string" && metadata.desc.trim()
                        ? metadata.desc
                        : "Sem descrição definida.";

                return ctx.replyNYX(
                    `📄 Descrição atual do grupo: ${descricao}`,
                    "user"
                );
            } catch {
                return ctx.replyNYX(
                    "❌ Não consegui consultar a descrição do grupo agora.",
                    "user"
                );
            }
        }

        const novaDescricao = args.join(" ").trim();

        if (!novaDescricao) {
            return ctx.replyNYX(
                "❌ A descrição do grupo não pode ficar vazia.",
                "user"
            );
        }

        requireAdmin(ctx);

        try {
            await ctx.sock.groupUpdateDescription(ctx.chat, novaDescricao);
        } catch {
            return ctx.replyNYX(
                "❌ Não foi possível atualizar a descrição. A plataforma pode ter recusado a alteração; confirme se o bot tem permissão para alterar as informações do grupo.",
                "user"
            );
        }

        return ctx.replyNYX(
            "✅ Descrição do grupo atualizada.",
            "user"
        );
    }
};
