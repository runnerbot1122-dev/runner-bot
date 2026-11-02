const ownerOnly = require("../../utils/ownerOnly");

module.exports = {
    name: ["criargp", "criargrupo"],
    description: "Cria um novo grupo",
    execute: async (ctx) => {
        ownerOnly(ctx);

        // Pega o nome do grupo (tudo o que foi digitado após o comando)
        const nomeGrupo = ctx.args.join(" ").trim();
        
        if (!nomeGrupo) {
            return ctx.replyNYX(`❌ Uso: \`${ctx.prefix}criargp Nome do Grupo\``, "user");
        }

        try {
            // Cria o grupo com o dono do bot e coloca ele mesmo no grupo
            const novoGrupo = await ctx.sock.groupCreate(nomeGrupo, [ctx.sender]);
            
            // Envia a mensagem no grupo novo
            await ctx.sock.sendMessage(novoGrupo.id, { 
                text: `✨ Grupo *${nomeGrupo}* criado com sucesso!\n\n👑 Dono: @${ctx.sender.split("@")[0]}`,
                mentions: [ctx.sender]
            });

            // Pega o link de convite
            const codigo = await ctx.sock.groupInviteCode(novoGrupo.id);
            const link = `https://chat.whatsapp.com/${codigo}`;

            return ctx.replyNYX({
                text: `✅ Grupo criado com sucesso!\n\n📌 *Nome:* ${nomeGrupo}\n🔗 *Link:* ${link}`,
                mentions: [ctx.sender]
            }, "bot");

        } catch (error) {
            console.error("[CRIARGP] Erro:", error);
            return ctx.replyNYX("❌ Não foi possível criar o grupo. Verifique a conexão do bot.", "bot");
        }
    }
};