const { getBotEmoji } = require("../../utils/botEmoji");
const replyNYX = require("../../utils/replyNYX");
const { getUser } = require("../../utils/users");

module.exports = {
    name: ["slot", "cassino", "apostar"],
    description: "Aposte seu XP no caça-níqueis",
    execute: async (ctx) => {
        const aposta = parseInt(ctx.args[0]);
        
        if (isNaN(aposta) || aposta <= 0) {
            return replyNYX(ctx, `🎰 *CAÇA-NÍQUEL (XP)*\n\nUso: *${ctx.prefix}slot <quantidade de XP>*\nExemplo: *${ctx.prefix}slot 50*`, "bot");
        }

        const user = getUser(ctx.sender);
        
        // Pega o XP atual (usando a mesma lógica do seu users.js)
        const saldoAtual = user.xp || 0;

        if (saldoAtual < aposta) {
            return replyNYX(ctx, `${getBotEmoji()} Você não tem XP suficiente!\n\nSeu XP atual: *${saldoAtual}*`, "bot");
        }

        try { await ctx.react("🎰"); } catch (e) {}

        // Sorteia os emojis
        const emojis = ['🍒', '🍋', '🍇', '💎', '🔔', '7️⃣'];
        const r1 = emojis[Math.floor(Math.random() * emojis.length)];
        const r2 = emojis[Math.floor(Math.random() * emojis.length)];
        const r3 = emojis[Math.floor(Math.random() * emojis.length)];

        const tabuleiro = `[ ${r1} | ${r2} | ${r3} ]`;
        let ganhou = 0;
        let mensagem = "";

        if (r1 === r2 && r2 === r3) {
            ganhou = aposta * 5; // Jackpot multiplica por 5
            mensagem = `🎉 *JACKPOT!* 🎉\n\n${tabuleiro}\n\nVocê ganhou *${ganhou}* de XP!`;
        } else if (r1 === r2 || r1 === r3 || r2 === r3) {
            ganhou = aposta * 2; // Dois iguais multiplica por 2
            mensagem = `✨ *Você ganhou!* ✨\n\n${tabuleiro}\n\nVocê ganhou *${ganhou}* de XP!`;
        } else {
            ganhou = 0;
            mensagem = `💀 *Você perdeu!* 💀\n\n${tabuleiro}\n\nVocê perdeu *${aposta}* de XP.`;
        }

        // Calcula o novo XP
        const novoXP = saldoAtual - aposta + ganhou;
        
        // Atualiza o XP no objeto do usuário
        user.xp = novoXP;
        
        // Se o seu bot usa xpTotal, a gente atualiza também para não bugar o ranking
        if (typeof user.xpTotal === "number") {
            user.xpTotal = Math.max(0, user.xpTotal - aposta + ganhou);
        }
        
        // Se o seu bot tem uma função de salvar o user (tipo saveUser ou updateUser), chame ela aqui.
        // Se o seu sistema salva automaticamente no final de cada comando, pode deixar assim.

        mensagem += `\n\n💰 Seu novo XP: *${novoXP}*`;
        
        await replyNYX(ctx, mensagem, "bot");
    }
};