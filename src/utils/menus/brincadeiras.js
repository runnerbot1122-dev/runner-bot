module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    const emoji = "💸";
    const linha = `║╎⊹ ࣪ ˖ ${emoji} ▸ `;
    const secao = (titulo, comandos) => `╠═✰『 ${titulo} 』✰
║╭━━━━──────━━━━╮
${comandos.map(cmd => `${linha}${prefixo}${cmd}`).join("\n")}
║╰━━━━──────━━━━╯`;

    return `
╔═━✰『 ᴍᴇɴᴜ-ʙʀɪɴᴄᴀᴅᴇɪʀᴀs 』═━✰
${secao("ᴊᴏɢᴏs", ["dado", "sorte", "caraoucoroa", "ppt", "quiz", "adivinha", "matematica", "forca", "jogodavelha", "slot", "enigma", "duelo"])}
${secao("ᴄᴀsᴀʟ ᴇ ᴀᴍɪᴢᴀᴅᴇ", ["casal", "ship", "namorar", "terminar", "divorciar", "dupla", "familia", "amigo", "amizade", "compatibilidade"])}
${secao("ʀᴀɴᴋɪɴɢs", ["rank", "rankgay", "rankgado", "rankfofo", "rankengracado", "ranksortudo", "rankinteligente", "rankparceiro"])}
${secao("ɪɴᴛᴇʀᴀᴛɪᴠᴏs", ["lindo", "linda", "fiel", "gostoso", "gostosa", "sigma", "beta", "baiano", "baiana", "carioca", "louco", "louca", "safado", "safada", "mencionar", "chance", "sorteio"])}
${secao("ғᴜɴ ᴇ ʀᴇᴀᴄ̧ᴏ̃ᴇs", ["meme", "piada", "cantada", "conselho", "motivacao", "frase", "fig", "tk", "shippar", "abraco", "carinho", "beijo", "dado2", "verdadeoudesafio"])}
${secao("ᴘᴇʀsᴏɴᴀɢᴇɴs ᴇ ᴄʀɪᴀᴄ̧ᴀ̃ᴏ", ["minhadupla", "meupar", "meumelhoramigo", "meumelhorpar", "sobrenome", "historia", "contardias", "perfil", "meunome", "meusigno"])}
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};