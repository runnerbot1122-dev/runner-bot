const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: "ping",
    description: "Teste de resposta",

    execute: async (ctx) => {
        const inicio = Date.now();

        await ctx.reply("🏓 Calculando...");

        const tempo = Date.now() - inicio;

        await ctx.replyNYX(
`╭━━━〔 🏓 ${fonteNYX("PONG!")} 〕━━━╮
┃
┃  ◈ ${fonteNYX("STATUS")} » ${fonteNYX("ONLINE")}
┃  ◈ ${fonteNYX("PING")}   » ${tempo} ms
┃
╰━━━━━━〔 ${fonteNYX("DEV EZ")} 〕━━━━━━╯`,
            "bot"
        );
    }
};
