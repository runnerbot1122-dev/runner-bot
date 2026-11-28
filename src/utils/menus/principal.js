const { getBotEmoji } = require("../../utils/botEmoji");

module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    
    const secao = (titulo, comandos) => {
        let bloco = `╠═✰『 ${titulo} 』✰\n║╭━━━━──────━━━━╮\n`;
        comandos.forEach(cmd => {
            bloco += `║╎⊹ ࣪ ˖ ${getBotEmoji()} ▸ ${prefixo}${cmd}\n`;
        });
        bloco += `║╰━━━━──────━━━━╯\n`;
        return bloco;
    };

    return `╔═━✰『 ᴍᴇɴᴜs 』═━✰
${secao("ᴍᴇɴᴜs", [
    "menuadm",
    "menustaff",
    "menubn",
    "menurank",
    "menucons",
    "efeitosimg",
    "noprefix",
    "status",
    "donos",
    "menudono"
])}
${secao("ɪɴғᴏs / ᴄʜᴇᴄᴋs", [
    "ping",
    "maisusados",
    "atividade",
    "rankativo",
    "rankativos",
    "checkativo",
    "infodono",
    "infobot",
    "criador",
    "avaliar",
    "alugar",
    "ver_aluguel",
    "statusapi"
])}
${secao("ᴅᴏᴡɴʟᴏᴀᴅs", [
    "play",
    "playvid",
    "playdoc",
    "playaudio",
    "playvideo",
    "playmp4",
    "ytmp3",
    "ytmp4",
    "ytsearch",
    "tiktok",
    "tiktok_video",
    "tiktok_audio",
    "tiktok2",
    "tiktok_video2",
    "tiktok_audio2",
    "instagram",
    "insta_audio",
    "instagram2",
    "insta_video2",
    "insta_audio2",
    "facebook",
    "face_video",
    "face_audio",
    "twitter_video",
    "twitter_audio",
    "kwai",
    "soundcloud",
    "mediafire",
    "gerarlink"
])}
${secao("ᴘᴇsǫᴜɪsᴀs", [
    "clima",
    "book",
    "movie",
    "imdb",
    "imdbinfo",
    "playstore",
    "serie",
    "series",
    "aptoide",
    "signo",
    "amazon",
    "amazonsearch",
    "wikipedia",
    "wiki",
    "pinterest",
    "getnoticias",
    "noticias",
    "googlenews",
    "gnews",
    "gruposwhatsapp",
    "letra",
    "letramusic",
    "cep",
    "ddd",
    "ip"
])}
${secao("ғɪɢᴜʀɪɴʜᴀs", [
    "fig",
    "fsticker",
    "sticker",
    "st",
    "stk",
    "circulo",
    "redonda",
    "saudio",
    "somfig",
    "figvideo",
    "figfundo",
    "figusemfundo",
    "figperfil",
    "figuweb",
    "toimg",
    "togif",
    "stickerinfo",
    "idfig",
    "rgfig",
    "listafig",
    "delfig",
    "stmetadata",
    "attp",
    "brat1",
    "brat2",
    "brat3",
    "brat4",
    "bratteste",
    "bratvteste",
    "bratvideo",
    "roubar",
    "take",
    "qc",
    "ttps"
])}
║╎⊹ ࣪ ˖ 🔊 ▸ *FIGURINHAS COM SOM*
║╎⊹ ࣪ ˖ Responda um áudio com *${prefixo}saudio* ou use em um vídeo com som.
║╎⊹ ࣪ ˖ *${prefixo}saudio 15* = até 15 segundos.
║╎⊹ ࣪ ˖ *${prefixo}s 1:05 10* = começa em 1:05 e dura 10 segundos.
║╎⊹ ࣪ ˖ *${prefixo}s mudo* = vídeo sem áudio; *${prefixo}s circulo* = redonda.
║╎⊹ ࣪ ˖ Responda a uma mídia com *${prefixo}sc* para refazer em círculo; sem mídia, *sc* continua sendo SoundCloud.
║╎⊹ ࣪ ˖ *${prefixo}somfig* = envia o áudio de uma figurinha com som como nota de voz.

${secao("ᴊᴏɢᴏs / ʙʀɪɴᴄᴀᴅᴇɪʀᴀs", [
    "forca",
    "jogodavelha",
    "resetvelha",
    "resetarvelha",
    "cassino",
    "slot",
    "dadoapostado",
    "roletarussa",
    "gartic",
    "enigma",
    "revelarenigma",
    "quizanimais",
    "quizfutebol",
    "anagrama",
    "enquete",
    "eununca",
    "vcprefere",
    "chance",
    "casal",
    "shipo"
])}
${secao("ᴍᴇᴍʙʀᴏs / ʀᴀɴᴅᴏᴍ", [
    "totext",
    "audiodoc",
    "responda",
    "gtts",
    "simi",
    "tagme",
    "emoji",
    "tabela",
    "mytag",
    "conselhosbilbicos",
    "cantadas",
    "conselhos",
    "simi",
    "perfil",
    "perfil2",
    "calcular",
    "calc",
    "obesidade",
    "contardias",
    "fazernick",
    "traduzir",
    "contato",
    "gerarcpf",
    "qrcode",
    "encurtalink",
    "getperfil",
    "getbio",
    "lembrete",
    "lermais",
    "spoiler",
    "idade",
    "wame"
])}
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};
