const LARGURA = 45;

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

function linha(conteudo = "") {
    const texto = cortar(conteudo, LARGURA - 4);
    const espacos = " ".repeat(LARGURA - 4 - texto.length);
    return "│ " + texto + espacos + " │";
}

function logMensagem({ usuario, remetente, chat, tipo, conteudo }) {
    const agora = new Date();
    const data = agora.toLocaleDateString("pt-BR");
    const hora = agora.toLocaleTimeString("pt-BR", { hour12: false });

    console.log("");
    console.log("╭" + "─".repeat(LARGURA - 2) + "╮");
    console.log(linha("NYX BOT • MENSAGEM RECEBIDA"));
    console.log("├" + "─".repeat(LARGURA - 2) + "┤");
    console.log(linha("USUÁRIO: " + cortar(usuario || "Desconhecido", 25)));
    console.log(linha("REMETENTE: " + cortar(remetente || "Indisponível", 25)));
    console.log(linha("CHAT: " + cortar(chat || "Desconhecido", 30)));
    console.log(linha("TIPO: " + cortar(tipo || "Texto", 30)));
    console.log(linha("CONTEÚDO: " + cortar(conteudo || "(sem texto)", 27)));
    console.log(linha("DATA: " + data + "  HORA: " + hora));
    console.log("╰" + "─".repeat(LARGURA - 2) + "╯");
}

module.exports = { logMensagem };
