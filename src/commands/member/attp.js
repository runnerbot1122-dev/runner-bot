const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

const execFileAsync = promisify(execFile);

module.exports = {
    name: ["attp"],
    description: "Cria uma figurinha com texto neon animado",
    execute: async (ctx) => {
        const texto = ctx.args.join(" ").trim();
        if (!texto) return replyNYX(ctx, `🎭 *ATTP*\n\nUso: ${ctx.prefix}attp [texto]`, "bot");

        try { await ctx.react("🎭"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "attp-"));
        const textFile = path.join(temp, "texto.txt");
        const saida = path.join(temp, "figurinha.webp");
        const fontPath = path.join(process.cwd(), "assets", "fonts", "attp.ttf");

        if (!fs.existsSync(fontPath)) {
            fs.rmSync(temp, { recursive: true, force: true });
            return replyNYX(ctx, "❌ Fonte attp.ttf não encontrada.", "bot");
        }

        try {
            const textoQuebrado = texto.toLowerCase().replace(/ /g, "\n");
            fs.writeFileSync(textFile, textoQuebrado);

            const palavras = texto.toLowerCase().split(" ");
            const maiorPalavra = Math.max(...palavras.map(p => p.length));
            
            let fontsize = 150; 
            if (maiorPalavra > 5) fontsize = 130; 
            if (maiorPalavra > 7) fontsize = 100;
            if (maiorPalavra > 9) fontsize = 80;

            // Texto desenhado em vermelho puro (0xFF0000) para o hue gerar cores fortes
            const dText = `drawtext=textfile='${textFile}':fontfile='${fontPath}':fontcolor=0xFF0000:fontsize=${fontsize}:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=15`;
            
            // SEM DESFOQUE (Adeus borda verde!):
            // 1. drawtext (desenha)
            // 2. colorkey (corta o verde de forma limpa)
            // 3. hue (gira as cores) + eq (saturação e contraste na medida para ficar sólido)
            const filterComplex = `[0:v]${dText},colorkey=0x00FF00:0.3:0.1,hue=h=1200*t:s=1.5,eq=saturation=1.8:contrast=1.1,format=rgba[out]`;

            await execFileAsync("ffmpeg", [
                "-y",
                "-f", "lavfi", "-i", "color=c=0x00FF00:s=512x512:d=2",
                "-filter_complex", filterComplex,
                "-map", "[out]",
                "-r", "15",
                "-vcodec", "libwebp",
                "-pix_fmt", "yuva420p", 
                "-loop", "0",
                saida
            ], { timeout: 60000 });

            await sendNYXMedia(ctx.sock, ctx.chat, { sticker: fs.readFileSync(saida) }, ctx.message);
        } catch (error) {
            console.error("[ATTP] Erro:", error.stderr || error.message);
            let msgErro = (error.stderr || error.message || "Desconhecido").trim();
            msgErro = msgErro.substring(msgErro.length - 200).replace(/\n/g, " ");
            await replyNYX(ctx, `❌ Erro FFmpeg:\n${msgErro}`, "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};