module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    const emoji = require("../../utils/botEmoji").getBotEmoji();
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
    "infogrupo",
    "limpar",
    "totag",
    "regras",
    "regraspp",
    "ephemeral",
    "msgtemp",
    "status"
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
    "antibtm",
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
    "legendabv",
    "legendasaiu",
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
    "addr",
    "delr",
    "listarrespostas",
    "testarresposta",
    "ativarresposta",
    "desativarresposta",
    "editarresposta",
    "configresposta",
    "lembretesgrupo",
    "cancelarlembrete",
    "limparlembretes",
    "odelete",
    "x9",
    "x9visuunica",
    "add_prefixo",
    "tirar_prefixo",
    "prefixos",
    "tempocmd",
    "limite_caracteres"
])}

${secao("ᴇxᴛʀᴀs", [
    "s",
    "x",
    "xp",
    "rank"
])}

╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};
