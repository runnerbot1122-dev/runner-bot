const fs = require("fs");
const path = require("path");
const fonteNYX = require("../../utils/fonteNYX");

module.exports = {
    name: ["ship", "shipar", "shippar", "shipo"],
    description: "Calcula a compatibilidade de amor entre duas pessoas",
    execute: async (ctx) => {
        const { sock, chat, sender, message } = ctx;

        // Pega TODAS as menções da mensagem
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        let pessoa1 = sender;
        let pessoa2 = null;

        // Lógica de quem vai ser shipado
        if (mentioned.length >= 2) {
            // Se marcou 2 ou mais, pega os dois primeiros
            pessoa1 = mentioned[0];
            pessoa2 = mentioned[1];
        } else if (mentioned.length === 1) {
            // Se marcou só 1, shippa ele com quem mandou
            pessoa2 = mentioned[0];
        } else {
            // Se não marcou ninguém, sorteia 2 membros do grupo
            try {
                const metadata = await sock.groupMetadata(chat);
                // Filtra o bot da lista de sorteados
                const membros = metadata.participants
                    .map(p => p.id)
                    .filter(id => !id.includes(sock.user.id.split(":")[0]));

                if (membros.length < 2) {
                    return ctx.replyNYX("❌ O grupo precisa de pelo menos 2 membros para sortear.", "user");
                }

                // Embaralha e pega 2
                const sorteados = membros.sort(() => 0.5 - Math.random());
                pessoa1 = sorteados[0];
                pessoa2 = sorteados[1];
            } catch (e) {
                return ctx.replyNYX("❌ Não consegui sortear as pessoas no grupo.", "bot");
            }
        }

        try { await ctx.react("💘"); } catch (e) {}

        const numero1 = pessoa1.split("@")[0];
        const numero2 = pessoa2.split("@")[0];

        // Cálculo da porcentagem
        let porcentagem = Math.floor(Math.random() * 101); // 0 a 100

        // Brincadeira: se um dos dois for o dono, aumenta a chance
        if (ctx.isOwner || ctx.isGroupOwner) {
            porcentagem = Math.floor(Math.random() * 20) + 80; // 80 a 100
        }

        // Escolhe a frase dependendo da %
        let frase = "";
        if (porcentagem === 0) frase = "Deus me livre, vocês se odeiam! 💔";
        else if (porcentagem <= 20) frase = "Amizade colorida? Tá mais pra ódio gratuito. 🥶";
        else if (porcentagem <= 50) frase = "Até que rola uma química, mas tem que insistir muito. 🥴";
        else if (porcentagem <= 80) frase = "O amor está no ar! Vocês formam um lindo casal. 🥰";
        else if (porcentagem < 100) frase = "Almas gêmeas! Já pode casar no cartório. 💍";
        else frase = "PERFEITOS! O cosmos conspirou pra vocês ficarem juntos. 🌌";

        // Aplica a fonte do bot na frase
        frase = fonteNYX(frase);

        // Texto da legenda
        const legenda = `💘 *SHIP*\n\n@${numero1} + @${numero2}\n\n💖 Compatibilidade: *${porcentagem}%*\n\n_${frase}_`;

        // Caminho do GIF
        const gifPath = path.join(__dirname, "..", "..", "..", "assets", "gifs", "ship.mp4");

        // Envia com GIF se existir, senão manda só texto
        if (fs.existsSync(gifPath)) {
            const gifBuffer = fs.readFileSync(gifPath);
            await sock.sendMessage(chat, {
                video: gifBuffer,
                gifPlayback: true,
                caption: legenda,
                mentions: [pessoa1, pessoa2]
            }, { quoted: message });
        } else {
            await sock.sendMessage(chat, {
                text: legenda,
                mentions: [pessoa1, pessoa2]
            }, { quoted: message });
        }
    }
};