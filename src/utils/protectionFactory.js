const { requireAdmin } = require("./checkPermission");
const { setSetting, getSetting } = require("./groups"); // Assumindo que você usa o groups.js para salvar as proteções

function criarComandoProtecao({ name, description, settingKey }) {
    return {
        name: Array.isArray(name) ? name : [name],
        description: description,
        execute: async (ctx) => {
            requireAdmin(ctx);
            if (!ctx.isGroup) return ctx.reply("❌ Apenas grupos.");

            const valor = ctx.args[0];
            if (valor !== "1" && valor !== "0") {
                return ctx.replyNYX(`⚙️ Uso:\n\n${ctx.prefix}${Array.isArray(name) ? name[0] : name} 1 (Ativar)\n${ctx.prefix}${Array.isArray(name) ? name[0] : name} 0 (Desativar)`, "bot");
            }

            const ativar = valor === "1";
            const atual = getSetting(ctx.chat, settingKey);

            if (atual === ativar) {
                return ctx.replyNYX(`ℹ️ Esta proteção já está ${ativar ? "ativada" : "desativada"}.`, "bot");
            }

            setSetting(ctx.chat, settingKey, ativar);
            await ctx.react(ativar ? "✅" : "❌");
            
            return ctx.replyNYX(`${ativar ? "🛡️ Proteção ATIVADA" : "🔓 Proteção DESATIVADA"}: *${description}*`, "bot");
        }
    };
}

module.exports = { criarComandoProtecao };