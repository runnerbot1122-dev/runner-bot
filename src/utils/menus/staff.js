module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    return `╔═━✰『 ᴍᴇɴᴜ-sᴛᴀғғ 』═━✰
║╭━━━━──────━━━━╮
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}addvip
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}delvip
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}viplist
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}setprefix
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}setnomebot
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}soadm
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}modox9
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}setpayment
║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}salvarconfig
║╰━━━━──────━━━━╯
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};