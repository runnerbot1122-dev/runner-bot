const { Image } = require("node-webpmux");

const EXIF_HEADER = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00
]);

function criarExif(packname, author) {
    const metadata = JSON.stringify({
        "sticker-pack-id": "com.runnerbot.take",
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        emojis: []
    });
    const dados = Buffer.from(metadata, "utf8");
    const cabecalho = Buffer.from(EXIF_HEADER);
    cabecalho.writeUInt32LE(dados.length, 14);
    return Buffer.concat([cabecalho, dados]);
}

async function aplicarMetadados(buffer, packname, author) {
    const imagem = new Image();
    await imagem.load(buffer);
    imagem.exif = criarExif(packname, author);
    return imagem.save(null);
}

module.exports = {
    aplicarMetadados,
    criarExif
};
