const replyNYX = require("../../utils/replyNYX");

module.exports = {
    name: ["calc", "calcular", "conta"],
    description: "Calculadora matemática",
    execute: async (ctx) => {
        const expressao = ctx.args.join(" ");
        if (!expressao) {
            return replyNYX(ctx, `🧮 *CALCULADORA*\n\nUso: *${ctx.prefix}calc 15 * 4 + 10*\n\nOperadores: + (soma), - (subtração), * (multiplicação), / (divisão)`, "bot");
        }

        // Trava de segurança: Apenas números, espaços e operadores básicos
        if (!/^[0-9+\-*/().\s]+$/.test(expressao)) {
            return replyNYX(ctx, "❌ Apenas números e operadores matemáticos (+, -, *, /) são permitidos.", "bot");
        }

        try {
            await ctx.react("🧮");
            
            // O eval é seguro aqui porque a regex acima bloqueia letras e comandos
            const resultado = eval(expressao); 
            
            await replyNYX(ctx, `🧮 *RESULTADO*\n\n📝 Conta: ${expressao}\n✅ Resultado: *${resultado}*`, "bot");
        } catch (error) {
            await replyNYX(ctx, "❌ Erro na conta. Verifique se a expressão está correta.", "bot");
        }
    }
};