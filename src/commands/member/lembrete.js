const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["lembrete", "lembrar", "timer"],
    description: "Cria um lembrete",
    execute: async (ctx) => {
        const args = ctx.args;
        if (args.length < 2) {
            return replyNYX(ctx, `⏰ *LEMBRETE*\n\nUso: *${ctx.prefix}lembrete <tempo> <mensagem>*\n\nTempo: use *s* (segundos), *m* (minutos) ou *h* (horas).\nExemplo: *${ctx.prefix}lembrete 10m Tomar água*`, "bot");
        }

        const tempoStr = args[0].toLowerCase();
        const mensagem = args.slice(1).join(" ");
        
        const match = tempoStr.match(/^(\d+)([smh])$/);
        if (!match) {
            return replyNYX(ctx, "❌ Formato de tempo inválido. Use s, m ou h. Exemplo: 10m ou 30s", "bot");
        }

        const valor = parseInt(match[1]);
        const unidade = match[2];
        
        let ms = 0;
        let tempoExibicao = "";

        if (unidade === "s") { ms = valor * 1000; tempoExibicao = `${valor} segundos`; }
        else if (unidade === "m") { ms = valor * 60 * 1000; tempoExibicao = `${valor} minutos`; }
        else if (unidade === "h") { ms = valor * 60 * 60 * 1000; tempoExibicao = `${valor} horas`; }

        try { await ctx.react("⏰"); } catch (e) {}

        await replyNYX(ctx, `⏰ Ok! Vou te lembrar de *"${mensagem}"* daqui a ${tempoExibicao}.`, "bot");

        // Agenda o aviso
        setTimeout(async () => {
            try {
                const textoAviso = `⏰ *LEMBRETE!*\n\n@${ctx.sender.split("@")[0]}, você me pediu para te lembrar:\n\n📌 *${mensagem}*`;
                await replyNYX(ctx, { text: textoAviso, mentions: [ctx.sender] }, "bot");
            } catch (e) {
                console.log("[LEMBRETE] Erro ao enviar:", e.message);
            }
        }, ms);
    }
};