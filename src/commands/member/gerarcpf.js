const replyNYX = require("../../utils/replyNYX");

function calcularDigito(numero) {
    let peso = numero.length - 1;
    let soma = numero.split("").reduce((total, digito) => total + Number(digito) * (peso--), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
}

function gerarCpf() {
    let base;
    do {
        base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
    } while (/^(\d)\1{8}$/.test(base));

    const primeiro = calcularDigito(`${base}0`);
    const segundo = calcularDigito(`${base}${primeiro}0`);
    const cpf = `${base}${primeiro}${segundo}`;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

module.exports = {
    name: ["gerarcpf"],
    description: "Gera um CPF válido apenas para testes",

    execute: async ctx => {
        return replyNYX(ctx, `🧪 *CPF PARA TESTE*\n\n${gerarCpf()}\n\n⚠️ Este CPF é aleatório e serve apenas para desenvolvimento/testes.`, "bot");
    }
};