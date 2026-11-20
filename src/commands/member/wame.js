const replyNYX = require("../../utils/replyNYX");

function limparNumero(valor) {
    return String(valor || "").replace(/\D/g, "");
}

module.exports = {
    name: ["wame"],
    description: "Gera um link wa.me",

    execute: async ctx => {
        const numero = limparNumero(ctx.args[0]);
        const mensagem = ctx.args.slice(1).join(" ").trim();

        if (numero.length < 10 || numero.length > 15) {
            return replyNYX(ctx, `🔗 Informe o número com DDI e DDD.\n\nUso: ${ctx.prefix}wame 5511999999999 Olá`, "bot");
        }

        const url = `https://wa.me/${numero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
        return replyNYX(ctx, `🔗 *LINK DO WHATSAPP*\n\n${url}`, "bot");
    }
};