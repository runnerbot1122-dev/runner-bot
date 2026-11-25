const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

const execFileAsync = promisify(execFile);

// Função pra quebrar o texto que nem no print (ex: "mayoral tá on" -> "mayoral" e "tá on")
function quebrarTexto(texto, limite = 8) {
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
    return linhas.join("\n");
}

module.exports = {
    name: ["brat", "brat1", "brat3", "brat4", "bratteste"],
    description: "Cria uma figurinha estilo Brat localmente",
    execute: async (ctx) => {
        const texto = ctx.args.join(" ").trim();
        if (!texto) return replyNYX(ctx, `🎭 *BRAT*\n\nUso: ${ctx.prefix}brat [texto]`, "bot");

        try { await ctx.react("🎭"); } catch (e) {}

        const temp = fs.mkdtempSync(path.join(os.tmpdir(), "brat-"));
        const textFile = path.join(temp, "texto.txt");
        const saida = path.join(temp, "figurinha.webp");
        const fontPath = path.join(process.cwd(), "assets", "fonts", "brat.ttf");

        try {
            fs.writeFileSync(textFile, quebrarTexto(texto.toLowerCase(), 9));

            await execFileAsync("ffmpeg", [
                "-y",
                "-f", "lavfi", "-i", "color=c=white:s=512x512",
                "-vf", `drawtext=textfile='${textFile}':fontcolor=black:fontsize=75:x=(w-text_w)/2:y=(h-text_h)/2:fontfile='${fontPath}':line_spacing=5`,
                "-vframes", "1",
                "-vcodec", "libwebp",
                saida
            ], { timeout: 15000 });

            await sendNYXMedia(ctx.sock, ctx.chat, { sticker: fs.readFileSync(saida) }, ctx.message);
        } catch (error) {
            console.error("[BRAT] Erro:", error.message);
            await replyNYX(ctx, "❌ Erro ao gerar o Brat.", "bot");
        } finally {
            fs.rmSync(temp, { recursive: true, force: true });
        }
    }
};
