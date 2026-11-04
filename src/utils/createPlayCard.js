const JimpLib = require("jimp");
const path = require("path");

const { Jimp } = JimpLib;
const W = 800, H = 450; 

let fontesPromise;
function carregarFontes() {
    if (!fontesPromise) {
        fontesPromise = Promise.all([
            JimpLib.loadFont(path.resolve("node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt")),
            JimpLib.loadFont(path.resolve("node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt"))
        ]);
    }
    return fontesPromise;
}

function limitarTexto(texto, fonte, largura) {
    texto = String(texto || "Desconhecido");
    if (JimpLib.measureText(fonte, texto) <= largura) return texto;
    while (texto.length > 3 && JimpLib.measureText(fonte, texto + "...") > largura) {
        texto = texto.slice(0, -1);
    }
    return texto.trimEnd() + "...";
}

async function criarPlayCard({ fundoPath, capaUrl, titulo, artista }) {
    const [fonteTitulo, fontePequena] = await carregarFontes();

    const [fundoBase, bufferCapa] = await Promise.all([
        Jimp.read(fundoPath),
        (async () => {
            const resp = await fetch(capaUrl, { signal: AbortSignal.timeout(8000) });
            if (!resp.ok) throw new Error("Falha ao baixar capa");
            return Buffer.from(await resp.arrayBuffer());
        })()
    ]);

    fundoBase.cover({ w: W, h: H });

    fundoBase.scan(0, 0, W, H, function (x, y, idx) {
        this.bitmap.data[idx] = Math.round(this.bitmap.data[idx] * 0.38);
        this.bitmap.data[idx + 1] = Math.round(this.bitmap.data[idx + 1] * 0.38);
        this.bitmap.data[idx + 2] = Math.round(this.bitmap.data[idx + 2] * 0.38);
    });

    const capa = await Jimp.read(bufferCapa);
    const tamanhoCapa = 240; 
    capa.cover({ w: tamanhoCapa, h: tamanhoCapa });

    const centro = tamanhoCapa / 2, raio = centro - 1;
    capa.scan(0, 0, tamanhoCapa, tamanhoCapa, function (x, y, idx) {
        const dx = x - centro, dy = y - centro;
        if (dx * dx + dy * dy > raio * raio) this.bitmap.data[idx + 3] = 0;
    });

    fundoBase.composite(capa, 50, (H - tamanhoCapa) / 2);

    const xTexto = 320, larguraTexto = 430;
    const baseY = 120; 

    fundoBase.print({ font: fontePequena, x: xTexto, y: baseY - 40, text: "RUNNER PLAY" });
    fundoBase.print({ font: fonteTitulo, x: xTexto, y: baseY, text: limitarTexto(titulo, fonteTitulo, larguraTexto) });
    fundoBase.print({ font: fontePequena, x: xTexto, y: baseY + 50, text: limitarTexto(artista, fontePequena, larguraTexto) });

    // CORREÇÃO DA BARRA: Agora desenha pixel por pixel sem quebrar
    const barraX = xTexto, barraY = baseY + 130, barraW = 400, barraH = 4;
    const COR_CINZA = JimpLib.rgbaToInt(150, 150, 150, 255);
    const COR_VERDE = JimpLib.rgbaToInt(45, 220, 105, 255);

    for (let x = barraX; x < barraX + barraW; x++) {
        for (let y = barraY; y < barraY + barraH; y++) {
            fundoBase.setPixelColor(COR_CINZA, x, y);
        }
    }

    const progresso = Math.floor(barraW * 0.58);
    for (let x = barraX; x < barraX + progresso; x++) {
        for (let y = barraY; y < barraY + barraH; y++) {
            fundoBase.setPixelColor(COR_VERDE, x, y);
        }
    }

    fundoBase.print({ font: fontePequena, x: barraX, y: barraY + 20, text: "PRÉVIA DE ÁUDIO" });
    fundoBase.print({ font: fontePequena, x: barraX + barraW - 42, y: barraY + 20, text: "30s" });

    return fundoBase.getBuffer("image/png");
}module.exports = criarPlayCard;
