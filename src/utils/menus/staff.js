const { getBotEmoji } = require("../../utils/botEmoji");

module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    return `╔═━✰『 ᴍᴇɴᴜ-sᴛᴀғғ 』═━✰
║╭━━━━──────━━━━╮
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}addvip
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}delvip
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}viplist
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}setprefix
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}setnomebot
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}soadm
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}modox9
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}setpayment
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}salvarconfig
║╰━━━━──────━━━━╯
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};