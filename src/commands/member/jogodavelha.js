const replyNYX = require("../../utils/replyNYX");
const { iniciarJogo } = require("../../core/gameManager");

function renderBoard(board) {
    const p = (i) => {
        if (board[i] === "X") return "❌";
        if (board[i] === "O") return "⭕";
        return `${i + 1}️⃣`;
    };
    
    return `*JOGO DA VELHA (PvP)*\n\n` +
           `${p(0)} | ${p(1)} | ${p(2)}\n` +
           `---+---+---\n` +
           `${p(3)} | ${p(4)} | ${p(5)}\n` +
           `---+---+---\n` +
           `${p(6)} | ${p(7)} | ${p(8)}\n\n`;
}

function checkWin(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winPatterns.some(pattern => pattern.every(index => board[index] === player));
}

module.exports = {
    name: ["jogodavelha", "velha"],
    description: "Joga o clássico Jogo da Velha contra outro membro",
    execute: async (ctx) => {
        const mentioned = ctx.message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length === 0) {
            return replyNYX(ctx, `❌ Você precisa marcar alguém para jogar!\n\nUso: ${ctx.prefix}jogodavelha @oponente`, "bot");
        }

        const jogador1 = ctx.sender; 
        const jogador2 = mentioned[0]; 

        if (jogador1 === jogador2) {
            return replyNYX(ctx, "❌ Você não pode jogar contra si mesmo!", "bot");
        }

        const board = ["", "", "", "", "", "", "", "", ""];
        
        iniciarJogo(ctx.chat, jogador1, "jogodavelha", { 
            board, 
            jogador1, 
            jogador2, 
            turno: jogador1
        });
        
        await replyNYX(ctx, 
            `${renderBoard(board)}\n@${jogador1.split("@")[0]} (❌) desafiou @${jogador2.split("@")[0]} (⭕)!\n\n🎮 É a vez de @${jogador1.split("@")[0]}. Digite um número de 1 a 9.`, 
            "bot", 
            [jogador1, jogador2]
        );
    },
    
    renderBoard,
    checkWin
};