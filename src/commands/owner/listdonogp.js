const ownerOnly = require("../../utils/ownerOnly");
const security = require("../../database/securityGroups");

module.exports = {
    name: ["listdonogp", "listadonos"],
    description: "Lista os donos registrados no grupo",
    execute: async (ctx) => {
        ownerOnly(ctx);

        if (!ctx.isGroup) {
            return ctx.replyNYX("❌ Use este comando dentro do grupo para ver o dono dele.", "user");
        }

        // Tenta puxar os donos do banco de segurança
        let donos = [];
        try {
            // Adapte para a função exata que você usa no securityGroups.js
            // Se você usa getGroupOwner (retorna 1 id) ou getGroupOwners (array)
            const db = require("../../database/database");
            const grupo = db.groups?.[ctx.chat];
            
            if (grupo?.owner) {
                donos = Array.isArray(grupo.owner) ? grupo.owner : [grupo.owner];
            } else if (grupo?.owners) {
                donos = grupo.owners;
            } else if (typeof security.getGroupOwner === 'function') {
                const owner = security.getGroupOwner(ctx.chat);
                if (owner) donos = [owner];
            }

        } catch (e) {
            console.error("[LISTDONOGP] Erro ao buscar donos:", e);
        }

        if (donos.length === 0) {
            return ctx.replyNYX("ℹ️ Este grupo não possui nenhum dono registrado.", "bot");
        }

        let texto = `👑 *DONOS REGISTRADOS NESTE GRUPO*\n\n`;
        donos.forEach((id, i) => {
            texto += `${i + 1}. @${id.split("@")[0]}\n`;
        });

        return ctx.replyNYX({ 
            text: texto, 
            mentions: donos 
        }, "user");
    }
};