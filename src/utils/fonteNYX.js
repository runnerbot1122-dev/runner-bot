const mapa = {
    a: "ᴀ",
    b: "ʙ",
    c: "ᴄ",
    d: "ᴅ",
    e: "ᴇ",
    f: "ғ",
    g: "ɢ",
    h: "ʜ",
    i: "ɪ",
    j: "ᴊ",
    k: "ᴋ",
    l: "ʟ",
    m: "ᴍ",
    n: "ɴ",
    o: "ᴏ",
    p: "ᴘ",
    q: "q",
    r: "ʀ",
    s: "s",
    t: "ᴛ",
    u: "ᴜ",
    v: "ᴠ",
    w: "ᴡ",
    x: "x",
    y: "ʏ",
    z: "ᴢ"
};

function fonteNYX(texto){

    if(typeof texto !== "string"){
        return texto;
    }

    // Preserve URLs, identificadores WhatsApp/e-mail e comandos literais para
    // não quebrar links, menções técnicas ou comandos que o usuário queira copiar.
    const partes = texto.split(/(https?:\/\/[^\s<>\[\]{}]+|[\w.+-]+@(?:s\.whatsapp\.net|lid|g\.us|newsletter)|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:^|\s)7[\w-]+)/giu);

    return partes.map((parte, indice) => {
        if (indice % 2 === 1) return parte;

        return parte
            .split("")
            .map(letra => {
                const minuscula = letra.toLowerCase();
                return mapa[minuscula] || letra;
            })
            .join("");
    }).join("");

}

module.exports = fonteNYX;