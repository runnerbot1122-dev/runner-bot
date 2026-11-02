module.exports = {
    name: "ppt",
    description: "Joga pedra, papel e tesoura",
    execute: async (ctx) => {
        const jogadas = ["pedra", "papel", "tesoura"];
        const escolha = String(ctx.args[0] || "").toLowerCase();
        if (!jogadas.includes(escolha)) {
            return ctx.reply("✊ Use: ppt pedra, ppt papel ou ppt tesoura.");
        }
        const bot = jogadas[Math.floor(Math.random() * jogadas.length)];
        const venceu = (
            escolha === "pedra" && bot === "tesoura" ||
            escolha === "papel" && bot === "pedra" ||
            escolha === "tesoura" && bot === "papel"
        );
        const resultado = escolha === bot ? "Empate" : venceu ? "Você venceu" : "Eu venci";
        await ctx.reply(`✊ Você: *${escolha}*\n🤖 Eu: *${bot}*\n\n🏁 *${resultado}*!`);
    }
};
