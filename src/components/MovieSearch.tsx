"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Film, Tv } from "lucide-react";
import Image from "next/image";
import { searchMoviesAction } from "@/app/actions";
import { TmdbSearchResult } from "@/lib/tmdb";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce"; // Vamos criar esse hook logo abaixo

export function MovieSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<TmdbSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Debounce para não chamar a API a cada letra digitada (espera 500ms)
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        async function fetchMovies() {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            const data = await searchMoviesAction(debouncedQuery);
            setResults(data);
            setLoading(false);
            setIsOpen(true);
        }

        fetchMovies();
    }, [debouncedQuery]);

    const handleSelect = (media: TmdbSearchResult) => {
        // Redireciona para a página de edição/confirmação (vamos criar essa página depois)
        router.push(`/add/${media.media_type}/${media.id}`);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto z-50">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder="Busque por filmes ou séries para adicionar..."
                    className="w-full bg-zinc-900/80 border border-zinc-800 text-zinc-100 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl shadow-2xl transition-all"
                />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-zinc-500" size={20} />
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-h-[60vh] overflow-y-auto">
                    {results.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800/50 last:border-0"
                        >
                            <div className="relative w-12 h-16 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                                {item.poster_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                        alt={item.title || item.name || "Capa"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-600">
                                        <Film size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-zinc-100 truncate">
                                    {item.title || item.name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded">
                    {item.media_type === "movie" ? (
                        <Film size={10} />
                    ) : (
                        <Tv size={10} />
                    )}
                      {item.media_type === "movie" ? "Filme" : "Série"}
                  </span>
                                    <span>
                    {item.release_date?.split("-")[0] ||
                        item.first_air_date?.split("-")[0] ||
                        "N/A"}
                  </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Clica fora para fechar (backdrop invisível) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}