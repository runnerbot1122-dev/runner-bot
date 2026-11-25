module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    const emoji = require("../../utils/botEmoji").getBotEmoji();
    const linha = `║╎⊹ ࣪ ˖ ${emoji} ▸ `;

    const secao = (titulo, comandos) =>
        `╠═✰『 ${titulo} 』✰
║╭━━━━──────━━━━╮
${comandos.map(cmd => `${linha}${prefixo}${cmd}`).join("\n")}
║╰━━━━──────━━━━╯`;

    return `
╔═━✰『 ᴍᴇɴᴜ-ɪᴀ 』═━✰

${secao("ᴄᴏɴᴠᴇʀsᴀᴄ̧ᴀ̃ᴏ", [
    "gpt",
    "gemini",
    "deepseek"
])}

${secao("ɪᴍᴀɢᴇɴs", [
    "flux",
    "imagine",
    "ia-sticker"
])}

╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};
