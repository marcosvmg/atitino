"use client";

import Image from "next/image";
import { Star, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Interaction {
    rating: number | null;
    review: string | null;
    status: string;
    user: {
        username: string;
        avatarUrl: string | null;
        name: string | null;
    };
}

interface MovieCardProps {
    movie: {
        id: string;
        tmdbId: number;
        type: string;
        title: string;
        posterPath: string | null;
        interactions: Interaction[];
    };
    currentUsername: string;
}

export function MovieCard({ movie, currentUsername }: MovieCardProps) {
    const router = useRouter();

    const posterUrl = movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : null;
    const myInteraction = movie.interactions.find(i => i.user.username === currentUsername);
    const otherInteractions = movie.interactions.filter(i => i.user.username !== currentUsername);
    const partnerInteraction = otherInteractions[0];

    return (
        <div
            onClick={() => router.push(`/add/${movie.type}/${movie.tmdbId}`)}
            className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all hover:shadow-2xl flex flex-col h-full cursor-pointer"
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
                {posterUrl ? (
                    <Image src={posterUrl} alt={movie.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600">Sem Imagem</div>
                )}

                {/* --- NOTA DO USUÁRIO (VIOLET-300) --- */}
                {/* Fundo claro, texto escuro e icone escuro */}
                {myInteraction && myInteraction.rating && myInteraction.rating > 0 && (
                    <div className="absolute top-2 left-2 bg-violet-300/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg z-10">
                        <Star size={12} className="text-violet-950 fill-violet-950" />
                        <span className="text-xs font-bold text-violet-950">{myInteraction.rating}</span>
                    </div>
                )}

                {/* --- NOTA DO PARCEIRO (FUCHSIA-300) --- */}
                {partnerInteraction && partnerInteraction.rating && partnerInteraction.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-fuchsia-300/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg z-10">
                        <span className="text-xs font-bold text-fuchsia-950">{partnerInteraction.rating}</span>
                        <Star size={12} className="text-fuchsia-950 fill-fuchsia-950" />
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-zinc-100 line-clamp-1 mb-3 text-center group-hover:text-white transition-colors">
                    {movie.title}
                </h3>

                <div className="space-y-3 flex-1">
                    {myInteraction?.review && (
                        // REVIEW BOX: Borda e fundo sutis, texto do nome brilhante
                        <div className="bg-violet-950/20 p-2 rounded-lg border border-violet-300/20">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-4 h-4 rounded-full bg-violet-300 overflow-hidden relative">
                                    {myInteraction.user.avatarUrl && <Image src={myInteraction.user.avatarUrl} fill alt="Me" className="object-cover" />}
                                </div>
                                <span className="text-[10px] text-violet-300 font-bold uppercase">Eu</span>
                            </div>
                            <p className="text-xs text-zinc-300 italic line-clamp-2">"{myInteraction.review}"</p>
                        </div>
                    )}

                    {partnerInteraction?.review && (
                        <div className="bg-fuchsia-950/20 p-2 rounded-lg border border-fuchsia-300/20 text-right">
                            <div className="flex items-center gap-2 mb-1 justify-end">
                                <span className="text-[10px] text-fuchsia-300 font-bold uppercase">{partnerInteraction.user.name?.split(" ")[0]}</span>
                                <div className="w-4 h-4 rounded-full bg-fuchsia-300 overflow-hidden relative">
                                    {partnerInteraction.user.avatarUrl && <Image src={partnerInteraction.user.avatarUrl} fill alt="Partner" className="object-cover" />}
                                </div>
                            </div>
                            <p className="text-xs text-zinc-300 italic line-clamp-2">"{partnerInteraction.review}"</p>
                        </div>
                    )}

                    {!myInteraction && (
                        <div className="text-center pt-2 mt-auto">
                <span className="text-xs text-zinc-500 flex items-center justify-center gap-1 group-hover:text-violet-300 transition-colors">
                    <Plus size={12} /> Avaliar também
                </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}