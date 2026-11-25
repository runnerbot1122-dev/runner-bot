module.exports = function (prefixo = "7") {
    const nomeBot = require("../../utils/botNameStore").getBotName();
    
    const secao = (titulo, comandos) => {
        let bloco = `╠═✰『 ${titulo} 』✰\n║╭━━━━──────━━━━╮\n`;
        comandos.forEach(cmd => {
            bloco += `║╎⊹ ࣪ ˖ 💸 ▸ ${prefixo}${cmd}\n`;
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
    "fsticker",
    "sticker",
    "st",
    "stk",
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
    "attp2",
    "attp_white",
    "attp_brat",
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
    "eununca",
    "vcprefere",
    "chance",
    "casal",
    "shipo"
])}
${secao("ᴍᴇᴍʙʀᴏs / ʀᴀɴᴅᴏᴍ", [
    "totext",
    "apex",
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
    "morechat",
    "obesidade",
    "contardias",
    "fazernick",
    "traduzir",
    "gerarcpf",
    "qrcode",
    "encurtalink",
    "getperfil",
    "getbio",
    "lermais",
    "spoiler",
    "idade",
    "wame"
])}
╠═ • ${nomeBot}
╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰
`;
};