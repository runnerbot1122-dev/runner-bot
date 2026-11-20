const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

const execFileAsync = promisify(execFile);

module.exports = {
    name: ["bratvideo", "bratv"],
    description: "Cria uma figurinha animada estilo Brat",
    execute: async (ctx) => {
        const texto = ctx.args.join(" ").trim();
        if (!texto) return replyNYX(ctx, `🟩 *BRAT VIDEO*\n\nUso: ${ctx.prefix}bratvideo [texto]`, "bot");

        try { await ctx.react("🟩"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "bratvideo-"));
        const textFile = path.join(temp, "texto.txt");
        const saida = path.join(temp, "figurinha.webp");
        
        // Usa a fonte que você já tem na pasta assets
        const fontPath = path.join(process.cwd(), "assets", "fonts", "brat.ttf");

        try {
            // Quebra o texto em linhas (igual ao brat estático)
            const textoQuebrado = texto.toLowerCase().replace(/ /g, "\n");
            fs.writeFileSync(textFile, textoQuebrado);

            // O Filtro: Gera o fundo branco, desenha o texto e aplica o zoom lento (zoompan)
            // O "d=1:s=512x512" faz o zoom ser aplicado frame a frame.
            const filtro = `drawtext=textfile='${textFile}':fontcolor=black:fontsize=75:x=(w-text_w)/2:y=(h-text_h)/2:fontfile='${fontPath}':line_spacing=5, format=yuva420p, zoompan=z='min(zoom+0.0015,1.2)':d=1:s=512x512`;

            await execFileAsync("ffmpeg", [
                "-y",
                "-f", "lavfi", "-i", "color=c=white:s=512x512:d=3",
                "-vf", filtro,
                "-r", "15",
                "-vcodec", "libwebp",
                "-pix_fmt", "yuva420p", 
                "-loop", "0",
                "-t", "3", // Duração de 3 segundos
                saida
            ], { timeout: 30000 });

            await sendNYXMedia(ctx.sock, ctx.chat, { sticker: fs.readFileSync(saida) }, ctx.message);
        } catch (error) {
            console.error("[BRATVIDEO] Erro:", error.stderr || error.message);
            await replyNYX(ctx, "❌ Erro ao gerar o Brat Video.", "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};