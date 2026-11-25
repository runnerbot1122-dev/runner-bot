const { getBotEmoji } = require("../../utils/botEmoji");

module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    return `╔═━✰『 ᴍᴇɴᴜ-ᴄᴏɴsᴜʟᴛᴀs 』═━✰
║╭━━━━──────━━━━╮
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}clima
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}signo
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}letra
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}cep
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}ddd
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}ip
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}wikipedia
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}noticias
║╰━━━━──────━━━━╯
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};