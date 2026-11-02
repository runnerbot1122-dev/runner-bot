module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    const emoji = "💸";
    const linha = `║╎⊹ ࣪ ˖ ${emoji} ▸ `;

    const secao = (titulo, comandos) => `╠═✰『 ${titulo} 』✰
║╭━━━━──────━━━━╮
${comandos.map(cmd => `${linha}${prefixo}${cmd}`).join("\n")}
║╰━━━━──────━━━━╯`;

    return `
╔═━✰『 ᴍᴇɴᴜ-ᴀᴅᴍ 』═━✰

${secao("ɢᴇsᴛᴀ̃ᴏ ᴅᴏ ɢʀᴜᴘᴏ", [
    "abrir",
    "fechar",
    "descgp",
    "nomegp",
    "mudarftgp",
    "rmphotogp",
    "link",
    "revlinkgp",
    "infogp",
    "limpar",
    "totag",
    "regras",
    "regraspp",
    "ephemeral",
    "msgtemp"
])}

${secao("ᴍᴇᴍʙʀᴏs", [
    "kick",
    "ban",
    "banfake",
    "banghost",
    "promover",
    "rebaixar",
    "mute",
    "mute2",
    "unmute",
    "mutelist",
    "adv",
    "rmadv",
    "warnings"
])}

${secao("ᴘʀᴏᴛᴇᴄᴏᴇs", [
    "antiimg",
    "antivideo",
    "antiaudio",
    "antisticker",
    "antitrava",
    "antidoc",
    "antidocumento",
    "anticontato",
    "anticatalogo",
    "antilink",
    "antilinkeasyon",
    "antilinkhard",
    "antifake",
    "antipalavra",
    "antidd",
    "antidd-list",
    "antiligacao",
    "antipay",
    "antipagamento",
    "antistatus",
    "antispam",
    "antiflood",
    "antidelete",
    "antiarqv",
    "soadm",
    "subdonogp",
    "bangp",
    "unbangp"
])}

${secao("ᴄᴏɴғɪɢᴜʀᴀᴄᴏᴇs", [
    "infobemvindo",
    "testebv",
    "welcome",
    "bemvindo2",
    "legendabv",
    "legendasaiu",
    "legendabv2",
    "legendasaiu2",
    "legenda_imagem",
    "legenda_video",
    "legenda_documento",
    "legenda_estrangeiro",
    "solicitacao",
    "aceitar",
    "recusar",
    "add_ddd",
    "del_ddd",
    "autorepo",
    "autosticker",
    "autofigu",
    "autototext",
    "odelete",
    "modox9",
    "x9visuunica",
    "add_prefixo",
    "tirar_prefixo",
    "prefixos",
    "tempocmd",
    "limite_caracteres"
])}

╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};