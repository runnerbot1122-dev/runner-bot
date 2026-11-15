const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

const execFileAsync = promisify(execFile);

// Mesma função do brat estático para quebrar o texto
function quebrarTexto(texto, limite = 9) {
    const palavras = texto.split(" ");
    let linhas = [];
    let linhaAtual = "";

    for (const palavra of palavras) {
        if ((linhaAtual + palavra).length > limite) {
            if (linhaAtual) linhas.push(linhaAtual.trim());
            linhaAtual = palavra + " ";
        } else {
            linhaAtual += palavra + " ";
        }
    }
    if (linhaAtual) linhas.push(linhaAtual.trim());
    return linhas;
}

module.exports = {
    name: ["brat2"],
    description: "Cria uma figurinha animada estilo Brat (texto por partes)",
    execute: async (ctx) => {
        const texto = ctx.args.join(" ").trim();
        if (!texto) return replyNYX(ctx, `🎭 *BRAT 2*\n\nUso: ${ctx.prefix}brat2 [texto]`, "bot");

        try { await ctx.react("🎬"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "brat2-"));
        const saida = path.join(temp, "figurinha.webp");
        const fontPath = path.join(process.cwd(), "assets", "fonts", "brat.ttf");

        try {
            // Quebra o texto em linhas (igual ao estático)
            const linhas = quebrarTexto(texto.toLowerCase(), 9);
            
            const delay = 0.8; // Delay entre as linhas
            const duracaoFinal = (linhas.length * delay) + 2.0; // Tempo total
            
            const fontsize = 75; // TAMANHO IGUAL AO ESTÁTICO
            const line_spacing = 10; // ESPAÇAMENTO IGUAL AO ESTÁTICO

            let filtros = [];

            // Para cada linha, cria um drawtext que aparece no tempo certo (enable)
            for (let i = 0; i < linhas.length; i++) {
                let startTime = i * delay;
                
                // Calcula a posição Y para centralizar o bloco de texto inteiro
                let yOffset = (i - (linhas.length - 1) / 2) * (fontsize + line_spacing);
                
                // O 'enable' faz a linha só aparecer quando o tempo (t) chegar no startTime
                let filter = `drawtext=text='${linhas[i]}':fontcolor=black:fontsize=${fontsize}:x=(w-text_w)/2:y=(h-text_h)/2+${yOffset}:enable='gte(t,${startTime})'`;
                
                if (fs.existsSync(fontPath)) {
                    filter = filter.replace("drawtext=", `drawtext=fontfile='${fontPath}':`);
                }
                
                filtros.push(filter);
            }

            const filterComplex = filtros.join(",");

            await execFileAsync("ffmpeg", [
                "-y",
                "-f", "lavfi", "-i", `color=c=white:s=512x512:d=${duracaoFinal}`,
                "-vf", filterComplex,
                "-r", "10",
                "-vcodec", "libwebp",
                "-pix_fmt", "yuva420p", 
                "-loop", "0",
                saida
            ], { timeout: 60000 });

            await sendNYXMedia(ctx.sock, ctx.chat, { sticker: fs.readFileSync(saida) }, ctx.message);
        } catch (error) {
            console.error("[BRAT2] Erro:", error.stderr || error.message);
            let msgErro = (error.stderr || error.message || "Desconhecido").trim();
            msgErro = msgErro.substring(msgErro.length - 200).replace(/\n/g, " ");
            await replyNYX(ctx, `❌ Erro FFmpeg:\n${msgErro}`, "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};