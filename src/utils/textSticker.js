const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");

const execFileAsync = promisify(execFile);

function escapeXml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function wrapText(value, maxChars = 22, maxLines = 12) {
    const words = String(value || "").trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";

    for (const word of words) {
        if (word.length > maxChars) {
            if (current) lines.push(current);
            for (let i = 0; i < word.length; i += maxChars) {
                lines.push(word.slice(i, i + maxChars));
            }
            current = "";
            continue;
        }

        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length > maxChars) {
            if (current) lines.push(current);
            current = word;
        } else {
            current = candidate;
        }
    }

    if (current) lines.push(current);
    return lines.slice(0, maxLines);
}

function ffmpegColor(value, fallback) {
    const color = String(value || fallback).replace(/^#/, "");
    return /^[0-9a-f]{6}$/i.test(color) ? `0x${color}` : fallback;
}

async function renderTextSticker(text, options = {}) {
    const lines = wrapText(text, options.maxChars || 22, options.maxLines || 12);
    if (!lines.length) throw new Error("Texto vazio.");

    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-text-") );
    const textFile = path.join(temp, "texto.txt");
    const output = path.join(temp, "figurinha.webp");
    const fontPath = options.fontPath || path.join(process.cwd(), "assets", "fonts", "brat.ttf");

    try {
        fs.writeFileSync(textFile, lines.join("\n"), "utf8");

        const background = ffmpegColor(options.background, "0xffffff");
        const color = ffmpegColor(options.color, "0x111827");
        const fontSize = Number(options.fontSize) || 40;
        const lineSpacing = Number(options.lineSpacing) || 8;
        const fontOption = fs.existsSync(fontPath) ? `:fontfile='${fontPath}'` : "";
        const filter = `drawtext=textfile='${textFile}':fontcolor=${color}:fontsize=${fontSize}:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=${lineSpacing}${fontOption}`;

        await execFileAsync("ffmpeg", [
            "-y",
            "-f", "lavfi",
            "-i", `color=c=${background}:s=512x512`,
            "-vf", filter,
            "-frames:v", "1",
            "-vcodec", "libwebp",
            "-lossless", "0",
            "-q:v", "70",
            output
        ], { timeout: 30000, maxBuffer: 5 * 1024 * 1024 });

        const buffer = fs.readFileSync(output);
        if (!buffer.length) throw new Error("FFmpeg gerou uma figurinha vazia.");
        return buffer;
    } finally {
        fs.rmSync(temp, { recursive: true, force: true });
    }
}

module.exports = {
    escapeXml,
    wrapText,
    renderTextSticker
};
