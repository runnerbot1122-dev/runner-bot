function calcular(expressao) {
    const partes = expressao.replace(/,/g, ".").match(/^(-?\d+(?:\.\d+)?)\s*([+\-*x×÷/])\s*(-?\d+(?:\.\d+)?)$/i);
    if (!partes) return null;
    const a = Number(partes[1]);
    const b = Number(partes[3]);
    switch (partes[2].toLowerCase()) {
        case "+": return a + b;
        case "-": return a - b;
        case "*":
        case "x":
        case "×": return a * b;
        case "/":
        case "÷": return b === 0 ? null : a / b;
        default: return null;
    }
}
module.exports = {
    name: "matematica",
    description: "Calcula uma operação matemática simples",
    execute: async (ctx) => {
        const expressao = ctx.args.join(" ");
        const resultado = calcular(expressao);
        if (resultado === null || !Number.isFinite(resultado)) {
            return ctx.reply("➗ Use uma operação simples, por exemplo: matematica 8 x 7.");
        }
        await ctx.reply(`🧮 ${expressao} = *${resultado}*`);
    }
};
