const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY não definida nas variáveis de ambiente");
}

export interface TmdbSearchResult {
    id: number;
    title?: string; // Para filmes
    name?: string;  // Para séries
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string; // Filmes
    first_air_date?: string; // Séries
    media_type: "movie" | "tv";
}

// Busca multi (Filmes e Séries misturados)
export async function searchTmdb(query: string): Promise<TmdbSearchResult[]> {
    if (!query) return [];

    const res = await fetch(
        `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(
            query
        )}&include_adult=false&page=1`
    );

    if (!res.ok) {
        console.error("Erro TMDB:", await res.text());
        throw new Error("Falha ao buscar no TMDB");
    }

    const data = await res.json();

    // Filtramos apenas filmes e séries, ignorando "pessoas" (atores)
    return data.results.filter(
        (item: any) => item.media_type === "movie" || item.media_type === "tv"
    );
}

// Busca detalhes específicos de um item
export async function getTmdbDetails(id: number, type: "movie" | "tv") {
    const res = await fetch(
        `${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=pt-BR`
    );

    if (!res.ok) return null;
    return res.json();
}