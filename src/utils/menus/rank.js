const { getBotEmoji } = require("../../utils/botEmoji");

module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    
    return `╔═━✰『 ᴍᴇɴᴜ-ʀᴀɴᴋs 』═━✰
║╭━━━━──────━━━━╮
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}rank
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}rankgay
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}rankgado
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}rankfofo
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}rankengracado
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}ranksortudo
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}rankinteligente
║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}rankparceiro
║╰━━━━──────━━━━╯
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};