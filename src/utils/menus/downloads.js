module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    const emoji = "💸";
    const linha = `║╎⊹ ࣪ ˖ ${emoji} ▸ `;
    const secao = (titulo, comandos) => `╠═✰『 ${titulo} 』✰
║╭━━━━──────━━━━╮
${comandos.map(cmd => `${linha}${prefixo}${cmd}`).join("\n")}
║╰━━━━──────━━━━╯`;

    return `
╔═━✰『 ᴍᴇɴᴜ-ᴅᴏᴡɴʟᴏᴀᴅs 』═━✰
${secao("ᴠíᴅᴇᴏs", ["ytmp4", "tiktok", "instagram", "facebook", "twitter"])}
${secao("ᴍúꜱɪᴄᴀꜱ", ["play", "spotify"])}
${secao("ᴇxᴛʀᴀꜱ", ["pinterest"])}
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};