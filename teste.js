const yts = require('yt-search');
const ytdl = require('shadowx-ytdl');
const axios = require('axios');

async function testar() {
    console.log("Iniciando teste...");
    
    console.time("⏱️ 1. Busca no YouTube");
    const search = await yts('mc ig let her go');
    console.timeEnd("⏱️ 1. Busca no YouTube");
    
    const url = search.videos[0].url;
    console.log("URL encontrada:", url);

    console.time("⏱️ 2. Conversão da API (shadowx)");
    const audio = await ytdl.downloadAudio(url, 128);
    console.timeEnd("⏱️ 2. Conversão da API (shadowx)");
    
    console.log("Link gerado:", audio.downloadUrl);

    console.time("⏱️ 3. Download do MP3");
    await axios.get(audio.downloadUrl, { responseType: 'arraybuffer' });
    console.timeEnd("⏱️ 3. Download do MP3");
    
    console.log("Teste finalizado!");
}

testar();
