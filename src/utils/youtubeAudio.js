const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

function textoSeguro(value, maxLength) {
    return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength).trim();
}

function nomeArquivoSeguro(title) {
    const base = textoSeguro(title, 90).normalize("NFKC").replace(/[<>:"/\\|?*]/g, "_").replace(/[. ]+$/g, "").trim();
    return `${base || "runner-play"}.mp3`;
}

function executarRapido(executavel, args, options) {
    return new Promise((resolve, reject) => {
        execFile(executavel, args, options, (error, stdout, stderr) => {
            if (error) {
                if (error.signal === 'SIGKILL' || error.code === 137) error.code = 'OOM';
                else if (error.signal === 'SIGTERM' || error.killed) error.code = 'TIMEOUT';
                return reject(error);
            }
            resolve({ stdout, stderr });
        });
    });
}

function obterBinarioEmbutido() {
    const dir = process.arch === 'x64' ? "linux-x64" : "linux-arm64";
    const bin = path.resolve(__dirname, "../../vendor/yt-dlp", dir, "yt-dlp");
    try { return fsSync.statSync(bin).isFile() ? bin : null; } catch { return null; }
}

async function buscarEBaixarAudio(query) {
    const busca = String(query || "").trim();
    if (!busca) return null;

    let tempDir;
    try {
        const exec = process.env.YT_DLP_PATH || obterBinarioEmbutido() || "yt-dlp";
        
        const argsBase = [
            "--ignore-config", 
            "--no-warnings", 
            "--no-progress", 
            "--quiet", 
            "--no-check-certificates",
            "--force-ipv4", 
            "--no-mtime",
            "--extractor-args", "youtube:player_client=android,web_music",
            "--concurrent-fragments", "4"
        ];

        console.log("[PLAY] Buscando musica...");
        const argsBusca = [...argsBase, "--print", "%(id)s", "--print", "%(title)s", "--print", "https://i.ytimg.com/vi/%(id)s/hqdefault.jpg", `ytsearch1:${busca}`];
        const resBusca = await executarRapido(exec, argsBusca, { timeout: 30000, maxBuffer: 1024 * 1024 });

        const linhas = String(resBusca.stdout).trim().split(/\r?\n/);
        if (linhas.length < 3) throw new Error("Nenhum resultado encontrado.");

        const id = linhas[0];
        const title = textoSeguro(linhas[1], 120);
        const thumbnail = linhas[2];
        const url = `https://www.youtube.com/watch?v=${id}`;

        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "runner-play-"));
        const inputPath = path.join(tempDir, "audio.raw");

        console.log("[PLAY] Baixando audio...");
        // Pede o áudio no formato mais leve possível (m4a/webm)
        const argsDownload = [...argsBase, "-f", "ba[ext=m4a]/ba/b", "--max-filesize", "15M", "-o", inputPath, url];
        await executarRapido(exec, argsDownload, { timeout: 60000, maxBuffer: 2 * 1024 * 1024 });

        const outputPath = path.join(tempDir, "audio.mp3");

        console.log("[PLAY] Convertendo (rápido)...");
        // Menos qualidade (96k) e threads forçadas no M12
        await executarRapido("ffmpeg", ["-y", "-loglevel", "error", "-threads", "2", "-i", inputPath, "-vn", "-ar", "44100", "-ac", "2", "-b:a", "96k", outputPath], { timeout: 30000 });

        const info = await fs.stat(outputPath).catch(() => null);
        if (!info) throw new Error("Erro ao gerar MP3.");

        const audioBuffer = await fs.readFile(outputPath);

        return {
            title,
            artist: "YouTube",
            thumbnailUrl: thumbnail,
            audioBuffer,
            fileName: nomeArquivoSeguro(title)
        };
    } catch (e) {
        console.error("[PLAY YT-DLP ERRO]", e.message);
        throw new Error("Falha no download da musica.");
    } finally {
        if (tempDir) await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
}

module.exports = { buscarEBaixarAudio };
