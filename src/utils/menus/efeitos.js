module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    const emoji = "💸";
    const linha = `║╎⊹ ࣪ ˖ ${emoji} ▸ `;
    const secao = (titulo, comandos) => `╠═✰『 ${titulo} 』✰
║╭━━━━──────━━━━╮
${comandos.map(cmd => `${linha}${prefixo}${cmd}`).join("\n")}
║╰━━━━──────━━━━╯`;

    return `
╔═━✰『 ᴇғᴇɪᴛᴏs ɪᴍɢ 』═━✰
${secao("Stickers de Texto", ["attp", "attp2", "attp_white", "attp_brat", "brat1", "brat2", "brat3", "brat4", "bratvideo"])}
${secao("Texto & Mídia", ["fancy", "efeito", "imgfiltro", "figfundo", "togif"])}
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};