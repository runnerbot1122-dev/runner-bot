module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    const emoji = "💸";
    const linha = `║╎⊹ ࣪ ˖ ${emoji} ▸ `;

    const secao = (titulo, comandos) =>
        `╠═✰『 ${titulo} 』✰
║╭━━━━──────━━━━╮
${comandos.map(cmd => `${linha}${prefixo}${cmd}`).join("\n")}
║╰━━━━──────━━━━╯`;

    return `
╔═━✰『 ᴍᴇɴᴜ-ᴅᴏᴡɴʟᴏᴀᴅs 』═━✰

${secao("ᴠɪ́ᴅᴇᴏs", [
    "youtube",
    "tiktok",
    "instagram",
    "facebook",
    "kwai",
    "twitter",
    "pinterest",
    "threads"
])}

${secao("ᴍᴜ́sɪᴄᴀs", [
    "play",
    "play2",
    "spotify",
    "soundcloud",
    "lyrics",
    "ytmp3",
    "ytmp4"
])}

${secao("ɪᴍᴀɢᴇɴs", [
    "pinterest",
    "wallpaper",
    "googleimg",
    "imgsearch"
])}

${secao("ᴏᴜᴛʀᴏs ᴅᴏᴡɴʟᴏᴀᴅs", [
    "mediafire",
    "gdrive",
    "apk",
    "tiktokmp3",
    "instagramdl",
    "facebookdl"
])}

╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};
