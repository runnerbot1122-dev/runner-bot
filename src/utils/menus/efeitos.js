const { getBotEmoji } = require("../../utils/botEmoji");

module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    return `╔═━✰『 ᴇғᴇɪᴛᴏs ɪᴍɢ 』═━✰
║╭━━━━──────━━━━╮
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}attp
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}attp2
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}attp_white
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}attp_brat
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}brat1
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}brat2
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}brat3
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}brat4
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}bratvideo
║╰━━━━──────━━━━╯
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};