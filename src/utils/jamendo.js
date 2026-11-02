
const API_BASE = "https://api.jamendo.com/v3.0";

async function buscarMusica(pesquisa) {
    const clientId = process.env.JAMENDO_CLIENT_ID?.trim();

    if (!clientId) {
        throw new Error("JAMENDO_CLIENT_ID não configurado no .env");
    }

    const url = new URL(`${API_BASE}/tracks/`);

    url.searchParams.set("client_id", clientId);
    url.searchParams.set("format", "json");
    url.searchParams.set("namesearch", pesquisa);
    url.searchParams.set("limit", "20");
    url.searchParams.set("audioformat", "mp32");
    url.searchParams.set("order", "relevance");

    const resposta = await fetch(url, {
        signal: AbortSignal.timeout(15000)
    });

    if (!resposta.ok) {
        throw new Error(`Jamendo respondeu HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();

    if (dados.headers?.status !== "success") {
        throw new Error("A API do Jamendo não retornou sucesso");
    }

    const musicas = (dados.results || []).filter(
        musica =>
            musica.id &&
            musica.name &&
            musica.artist_name &&
            musica.audio &&
            musica.audiodownload_allowed === true
    );

    return musicas[0] || null;
}

module.exports = { buscarMusica };
