const JimpLib = require("jimp");
const path = require("path");

const { Jimp } = JimpLib;
const W = 900, H = 300;
const MAX_CAPA_BYTES = 8 * 1024 * 1024;

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

    // Lê o fundo em paralelo com a capa
    const [fundoBase, bufferCapa] = await Promise.all([
        Jimp.read(fundoPath),
        (async () => {
            const resp = await fetch(capaUrl, { signal: AbortSignal.timeout(8000) });
            if (!resp.ok) throw new Error("Falha ao baixar capa");
            return Buffer.from(await resp.arrayBuffer());
        })()
    ]);

    fundoBase.cover({ w: W, h: H });
    
    // Escurece o fundo inteiro de forma otimizada
    fundoBase.scan(0, 0, W, H, function (x, y, idx) {
        this.bitmap.data[idx] = Math.round(this.bitmap.data[idx] * 0.38);
        this.bitmap.data[idx + 1] = Math.round(this.bitmap.data[idx + 1] * 0.38);
        this.bitmap.data[idx + 2] = Math.round(this.bitmap.data[idx + 2] * 0.38);
    });

    const capa = await Jimp.read(bufferCapa);
    const tamanhoCapa = 190;
    capa.cover({ w: tamanhoCapa, h: tamanhoCapa });
    
    // Máscara circular rápida
    const centro = tamanhoCapa / 2, raio = centro - 1;
    capa.scan(0, 0, tamanhoCapa, tamanhoCapa, function (x, y, idx) {
        const dx = x - centro, dy = y - centro;
        if (dx * dx + dy * dy > raio * raio) this.bitmap.data[idx + 3] = 0;
    });

    fundoBase.composite(capa, 45, 55);

    const xTexto = 275, larguraTexto = 570;

    fundoBase.print({ font: fontePequena, x: xTexto, y: 35, text: "RUNNER PLAY" });
    fundoBase.print({ font: fonteTitulo, x: xTexto, y: 76, text: limitarTexto(titulo, fonteTitulo, larguraTexto) });
    fundoBase.print({ font: fontePequena, x: xTexto, y: 123, text: limitarTexto(artista, fontePequena, larguraTexto) });

    // Barra de progresso decorativa (mais rápido usando setPixelColor nativo)
    const barraX = xTexto, barraY = 207, barraW = 535, barraH = 4;
    const COR_CINZA = JimpLib.rgbaToInt(150, 150, 150, 255);
    const COR_VERDE = JimpLib.rgbaToInt(45, 220, 105, 255);
    
    // Fundo da barra (cinza)
    fundoBase.scan(barraX, barraY, barraW, barraH, function() {
        this.setPixelColor(COR_CINZA, this.bitmap.width, this.bitmap.height);
    });
    
    // Progresso (verde) - setando de forma otimizada
    const progresso = Math.floor(barraW * 0.58);
    for (let x = barraX; x < barraX + progresso; x++) {
        for (let y = barraY; y < barraY + barraH; y++) {
            fundoBase.setPixelColor(COR_VERDE, x, y);
        }
    }

    fundoBase.print({ font: fontePequena, x: barraX, y: 225, text: "PRÉVIA DE ÁUDIO" });
    fundoBase.print({ font: fontePequena, x: barraX + barraW - 42, y: 225, text: "30s" });

    return fundoBase.getBuffer("image/png");
}

module.exports = criarPlayCard;