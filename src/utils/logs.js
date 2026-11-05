const LARGURA = 42;

function limpar(valor) {
    return String(valor ?? "")
        .replace(/[\r\n\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function cortar(valor, tamanho) {
    const texto = limpar(valor);
    return texto.length > tamanho
        ? texto.slice(0, tamanho - 1) + "…"
        : texto;
}

function alinhar(texto, tamanho) {
    const limpo = cortar(texto, tamanho);
    return limpo + " ".repeat(Math.max(0, tamanho - limpo.length));
}

function centralizar(texto) {
    const espacos = Math.floor((LARGURA - texto.length) / 2);
    return " ".repeat(Math.max(0, espacos)) + texto;
}

function linha(campo, valor) {
    return `  ${alinhar(campo, 12)} ${alinhar(valor, 26)}  `;
}

function logMensagem({ usuario, remetente, chat, tipo, conteudo }) {
    const agora = new Date();
    const data = agora.toLocaleDateString("pt-BR");
    const hora = agora.toLocaleTimeString("pt-BR", { hour12: false });

    const linhaTracejada = "▬".repeat(LARGURA);
    
    console.log("");
    console.log(linhaTracejada);
    console.log(centralizar("DEV EZ"));
    console.log(linhaTracejada);
    console.log("");
    console.log(linha("USUÁRIO:", usuario || "Desconhecido"));
    console.log(linha("NÚMERO:", remetente || "Indisponível"));
    console.log(linha("CHAT:", chat || "Desconhecido"));
    console.log(linha("TIPO:", tipo || "Texto"));
    console.log(linha("CONTEÚDO:", conteudo || "(sem texto)"));
    console.log(linha("DATA:", data));
    console.log(linha("HORA:", hora));
    console.log("");
    console.log(linhaTracejada);
    console.log(centralizar("DEV EZ"));
    console.log(linhaTracejada);
    console.log("");
}

module.exports = { logMensagem };