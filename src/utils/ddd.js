// src/utils/ddd.js
const { getSetting, setSetting } = require("./groups");

// DDDs padrão do Brasil (se o grupo não tiver nenhum customizado)
const DDDS_PADRAO = [
    "11", "12", "13", "14", "15", "16", "17", "18", "19", // SP
    "21", "22", "24", // RJ
    "27", "28", // ES
    "31", "32", "33", "34", "35", "37", "38", // MG
    "41", "42", "43", "44", "45", "46", // PR
    "47", "48", "49", // SC
    "51", "53", "54", "55", // RS
    "61", // DF
    "62", "64", // GO
    "63", // TO
    "65", "66", // MT
    "67", // MS
    "68", // AC
    "69", // RO
    "71", "73", "74", "75", "77", // BA
    "79", // SE
    "81", "87", // PE
    "82", // AL
    "83", // PB
    "84", // RN
    "85", "88", // CE
    "86", "89", // PI
    "91", "93", "94", // PA
    "92", "97", // AM
    "95", // RR
    "96", // AP
    "98", "99" // MA
];

// Retorna a lista de DDDs configurada no grupo (ou a padrão)
function getDDDsBloqueados(chat) {
    const lista = getSetting(chat, "dddBloqueados");
    if (Array.isArray(lista)) return lista;
    return DDDS_PADRAO; // Se não tiver customizado, usa a padrão
}

// Adiciona um DDD à lista de bloqueio
function addDDD(chat, ddd) {
    let lista = getDDDsBloqueados(chat);
    ddd = String(ddd).replace(/\D/g, ""); // Remove tudo que não for número
    
    if (ddd.length !== 2) return { ok: false, msg: "O DDD deve ter exatamente 2 números." };
    if (lista.includes(ddd)) return { ok: false, msg: "Esse DDD já está na lista." };

    lista.push(ddd);
    setSetting(chat, "dddBloqueados", lista);
    return { ok: true, msg: `DDD ${ddd} adicionado à lista de bloqueio.` };
}

// Remove um DDD da lista
function delDDD(chat, ddd) {
    let lista = getDDDsBloqueados(chat);
    ddd = String(ddd).replace(/\D/g, "");
    
    const index = lista.indexOf(ddd);
    if (index === -1) return { ok: false, msg: "Esse DDD não está na lista." };

    lista.splice(index, 1);
    setSetting(chat, "dddBloqueados", lista);
    return { ok: true, msg: `DDD ${ddd} removido da lista de bloqueio.` };
}

// Verifica se um número de telefone tem um DDD bloqueado
function isDDDBloqueado(chat, numeroJid) {
    // O JID do WhatsApp vem como "5511999999999@s.whatsapp.net"
    const numero = String(numeroJid).split("@")[0];
    
    // Ignora números que não são do Brasil (não começam com 55)
    if (!numero.startsWith("55")) return false;

    // Pega os dois dígitos após o 55
    const ddd = numero.substring(2, 4);
    const lista = getDDDsBloqueados(chat);
    
    return lista.includes(ddd);
}

module.exports = { getDDDsBloqueados, addDDD, delDDD, isDDDBloqueado, DDDS_PADRAO };