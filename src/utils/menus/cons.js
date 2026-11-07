module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    return `╔═━✰『 ᴍᴇɴᴜ-ᴄᴏɴsᴜʟᴛᴀs 』═━✰
║╭━━━━──────━━━━╮
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}clima
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}signo
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}letra
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}cep
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}ddd
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}ip
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}wikipedia
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}noticias
║╰━━━━──────━━━━╯
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};