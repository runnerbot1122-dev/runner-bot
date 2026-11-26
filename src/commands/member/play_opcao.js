const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");
const { buscarEBaixarAudio } = require("../../utils/youtubeAudio");

const execFileAsync = promisify(execFile);
const MAX_FILE_SIZE = 60 * 1024 * 1024;
const NEXRAY_PLAY_URL = "https://api.nexray.eu.cc/downloader/ytplay";
const COBALT_API_URL = String(process.env.COBALT_API_URL || "").trim().replace(/\/$/, "");

function nomeSeguro(nome, padrao) {
    const valor = String(nome || padrao).replace(/[\\/:*?"<>|\r\n]/g, "_").trim();
    return valor || padrao;
}

async function baixarAudioNexray(link) {
    const apiResponse = await axios.get(NEXRAY_PLAY_URL, {
        params: { q: link },
        timeout: 60000,
        headers: { Accept: "application/json", "User-Agent": "NexRay-API-Client/1.0.0" }
    });

    const result = apiResponse.data?.result;
    if (!apiResponse.data?.status || !result?.download_url) {
        throw new Error(apiResponse.data?.error || "A NexRay não retornou download_url.");
    }

    const fileResponse = await axios.get(result.download_url, {
        responseType: "arraybuffer",
        timeout: 300000,
        maxContentLength: MAX_FILE_SIZE,
        maxBodyLength: MAX_FILE_SIZE
    });

    const audioBuffer = Buffer.from(fileResponse.data || []);
    if (!audioBuffer.length || audioBuffer.length > MAX_FILE_SIZE) {
        throw new Error("Áudio NexRay vazio ou maior que 60 MB.");
    }

    return {
        audioBuffer,
        title: result.title,
        fileName: `${nomeSeguro(result.title, "runner-play")}.mp3`
    };
}

async function baixarCobalt(link, tipo) {
    if (!COBALT_API_URL) {
        throw new Error("COBALT_API_URL não configurada.");
    }

    const parametros = tipo === "audio"
        ? {
            url: link,
            downloadMode: "audio",
            audioFormat: "mp3",
            audioBitrate: "128",
            filenameStyle: "basic"
        }
        : {
            url: link,
            downloadMode: "auto",
            videoQuality: "720",
            youtubeVideoContainer: "mp4",
            filenameStyle: "basic"
        };

    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "runner-bot-cobalt/1.0"
    };

    if (process.env.COBALT_API_KEY?.trim()) {
        headers.Authorization = `Api-Key ${process.env.COBALT_API_KEY.trim()}`;
    }

    const response = await axios.post(COBALT_API_URL, parametros, {
        headers,
        timeout: 120000,
        maxContentLength: 2 * 1024 * 1024
    });

    const dados = response.data || {};
    if (!["tunnel", "redirect"].includes(dados.status) || !dados.url) {
        const codigo = dados.error?.code || dados.error || dados.status || "resposta sem URL";
        throw new Error(`Cobalt não retornou mídia: ${codigo}`);
    }

    const arquivo = await axios.get(dados.url, {
        responseType: "arraybuffer",
        timeout: 300000,
        maxContentLength: MAX_FILE_SIZE,
        maxBodyLength: MAX_FILE_SIZE,
        headers: { "User-Agent": "runner-bot-cobalt/1.0" }
    });

    const buffer = Buffer.from(arquivo.data || []);
    if (!buffer.length || buffer.length > MAX_FILE_SIZE) {
        throw new Error("Arquivo Cobalt vazio ou maior que 60 MB.");
    }

    const nome = nomeSeguro(dados.filename, tipo === "audio" ? "runner-play" : "runner-play-video");
    return {
        buffer,
        title: nome.replace(/\.[^.]+$/, ""),
        fileName: nome.includes(".") ? nome : `${nome}.${tipo === "audio" ? "mp3" : "mp4"}`
    };
}

async function baixarAudioYtDlp(link) {
    const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-play-audio-"));

    try {
        const output = path.join(temporario, "audio.%(ext)s");
        await execFileAsync("yt-dlp", [
            "--no-warnings",
            "--no-playlist",
            "--extract-audio",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "--max-filesize", "60M",
            "--no-part",
            "-o", output,
            link
        ], {
            timeout: 240000,
            maxBuffer: 10 * 1024 * 1024
        });

        const arquivo = fs.readdirSync(temporario)
            .find(nome => /\.(mp3|m4a|opus|webm|aac|wav)$/i.test(nome));

        if (!arquivo) throw new Error("yt-dlp não gerou um arquivo de áudio.");

        const caminho = path.join(temporario, arquivo);
        const audioBuffer = fs.readFileSync(caminho);
        if (!audioBuffer.length) throw new Error("yt-dlp gerou um áudio vazio.");
        if (audioBuffer.length > MAX_FILE_SIZE) throw new Error("Áudio maior que 60 MB.");

        return {
            audioBuffer,
            title: path.basename(arquivo).replace(/\.[^.]+$/, ""),
            fileName: `${nomeSeguro(path.basename(arquivo).replace(/\.[^.]+$/, ""), "runner-play")}.mp3`
        };
    } finally {
        fs.rmSync(temporario, { recursive: true, force: true });
    }
}

module.exports = {
    name: ["play_opcao_interno"],
    description: "Processa as opções internas do menu Play",
    execute: async ctx => {
        const tipo = String(ctx.args?.[0] || "").toLowerCase();
        const link = decodeURIComponent(String(ctx.args?.[1] || ""));

        if (!link || !/^https?:\/\//i.test(link)) {
            return replyNYX(ctx, "❌ O link selecionado não é válido.", "bot");
        }

        await ctx.reply("⏳ Preparando o formato escolhido, aguarde...");

        if (tipo === "audio" || tipo === "document") {
            try {
                let faixa;

                try {
                    const cobalt = await baixarCobalt(link, "audio");
                    faixa = {
                        audioBuffer: cobalt.buffer,
                        title: cobalt.title,
                        fileName: cobalt.fileName
                    };
                    console.log(`[PLAY ${tipo.toUpperCase()}] Download concluído via Cobalt`);
                } catch (cobaltError) {
                    console.error(`[PLAY ${tipo.toUpperCase()}] Cobalt falhou; usando NexRay:`, cobaltError.message);

                    try {
                        faixa = await baixarAudioNexray(link);
                        console.log(`[PLAY ${tipo.toUpperCase()}] Download concluído via NexRay`);
                    } catch (nexrayError) {
                        console.error(`[PLAY ${tipo.toUpperCase()}] NexRay falhou; usando yt-dlp:`, nexrayError.message);

                        try {
                            faixa = await baixarAudioYtDlp(link);
                            console.log(`[PLAY ${tipo.toUpperCase()}] Download concluído via yt-dlp`);
                        } catch (ytDlpError) {
                            console.error(`[PLAY ${tipo.toUpperCase()}] yt-dlp falhou; usando Denzy:`, ytDlpError.message);
                            faixa = await buscarEBaixarAudio(link);
                        }
                    }
                }

                if (!faixa?.audioBuffer) throw new Error("Áudio não encontrado.");
                const fileName = faixa.fileName || "runner-play.mp3";

                if (tipo === "document") {
                    return await sendNYXMedia(ctx.sock, ctx.chat, {
                        document: faixa.audioBuffer,
                        mimetype: "audio/mpeg",
                        fileName,
                        caption: `📄 ${faixa.title || "Áudio do YouTube"}`
                    }, ctx.message);
                }

                return await sendNYXMedia(ctx.sock, ctx.chat, {
                    audio: faixa.audioBuffer,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName
                }, ctx.message);
            } catch (error) {
                console.error(`[PLAY ${tipo.toUpperCase()}] Erro:`, error.message);
                return replyNYX(ctx, `❌ Não consegui gerar o ${tipo === "document" ? "documento" : "áudio"}.`, "bot");
            }
        }

        if (tipo === "video") {
            try {
                try {
                    const cobalt = await baixarCobalt(link, "video");
                    return await sendNYXMedia(ctx.sock, ctx.chat, {
                        video: cobalt.buffer,
                        mimetype: "video/mp4",
                        fileName: cobalt.fileName,
                        caption: "🎬 Vídeo baixado pelo Play"
                    }, ctx.message);
                } catch (cobaltError) {
                    console.error("[PLAY VÍDEO] Cobalt falhou; usando yt-dlp:", cobaltError.message);
                }

                const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "runnerbot-play-video-"));
                try {
                const output = path.join(temporario, "video.%(ext)s");
                await execFileAsync("yt-dlp", [
                    "--no-warnings",
                    "--no-playlist",
                    "--format", "best[ext=mp4]/best",
                    "--max-filesize", "60M",
                    "--no-part",
                    "-o", output,
                    link
                ], { timeout: 240000, maxBuffer: 10 * 1024 * 1024 });

                const file = fs.readdirSync(temporario).find(nome => /\.(mp4|webm|mkv)$/i.test(nome));
                if (!file) throw new Error("Vídeo não encontrado.");

                const buffer = fs.readFileSync(path.join(temporario, file));
                if (!buffer.length || buffer.length > MAX_FILE_SIZE) throw new Error("Vídeo maior que 60 MB.");

                return await sendNYXMedia(ctx.sock, ctx.chat, {
                    video: buffer,
                    mimetype: /\.mp4$/i.test(file) ? "video/mp4" : "video/webm",
                    caption: "🎬 Vídeo baixado pelo Play"
                }, ctx.message);
                } finally {
                    fs.rmSync(temporario, { recursive: true, force: true });
                }
            } catch (error) {
                console.error("[PLAY VÍDEO] Erro:", error.message);
                return replyNYX(ctx, "❌ Não consegui baixar o vídeo escolhido.", "bot");
            }
        }

        return replyNYX(ctx, "❌ Formato de Play inválido.", "bot");
    }
};
