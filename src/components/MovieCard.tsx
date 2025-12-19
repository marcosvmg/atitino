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
            className="group relative bg-zinc-900 border border-zinc-800 rounded-xl md:rounded-2xl overflow-hidden hover:border-zinc-700 transition-all hover:shadow-2xl flex flex-col h-full cursor-pointer"
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
                {posterUrl ? (
                    <Image src={posterUrl} alt={movie.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600 text-xs">Sem Imagem</div>
                )}

                {/* NOTA USUÁRIO: Ajustado tamanho e padding para mobile */}
                {myInteraction && myInteraction.rating && myInteraction.rating > 0 && (
                    <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 bg-violet-300/95 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg flex items-center gap-1 shadow-lg z-10">
                        <Star size={10} className="text-violet-950 fill-violet-950 md:w-3 md:h-3" />
                        <span className="text-[10px] md:text-xs font-bold text-violet-950">{myInteraction.rating}</span>
                    </div>
                )}

                {/* NOTA PARCEIRO */}
                {partnerInteraction && partnerInteraction.rating && partnerInteraction.rating > 0 && (
                    <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-fuchsia-300/95 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg flex items-center gap-1 shadow-lg z-10">
                        <span className="text-[10px] md:text-xs font-bold text-fuchsia-950">{partnerInteraction.rating}</span>
                        <Star size={10} className="text-fuchsia-950 fill-fuchsia-950 md:w-3 md:h-3" />
                    </div>
                )}
            </div>

            {/* CONTEÚDO: Padding reduzido no mobile (p-3 vs p-4) */}
            <div className="p-2.5 md:p-4 flex flex-col flex-1">
                {/* Título menor no mobile */}
                <h3 className="font-semibold text-zinc-100 line-clamp-1 mb-2 md:mb-3 text-center text-xs md:text-sm group-hover:text-white transition-colors">
                    {movie.title}
                </h3>

                <div className="space-y-2 md:space-y-3 flex-1">
                    {myInteraction?.review && (
                        // REVIEW BOX: Fonte bem pequena no mobile (text-[10px])
                        <div className="bg-violet-950/20 p-1.5 md:p-2 rounded-lg border border-violet-300/20">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-violet-300 overflow-hidden relative">
                                    {myInteraction.user.avatarUrl && <Image src={myInteraction.user.avatarUrl} fill alt="Me" className="object-cover" />}
                                </div>
                                <span className="text-[9px] md:text-[10px] text-violet-300 font-bold uppercase">Eu</span>
                            </div>
                            <p className="text-[10px] md:text-xs text-zinc-300 italic line-clamp-2 leading-tight">"{myInteraction.review}"</p>
                        </div>
                    )}

                    {partnerInteraction?.review && (
                        <div className="bg-fuchsia-950/20 p-1.5 md:p-2 rounded-lg border border-fuchsia-300/20 text-right">
                            <div className="flex items-center gap-1.5 mb-0.5 justify-end">
                                <span className="text-[9px] md:text-[10px] text-fuchsia-300 font-bold uppercase">{partnerInteraction.user.name?.split(" ")[0]}</span>
                                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-fuchsia-300 overflow-hidden relative">
                                    {partnerInteraction.user.avatarUrl && <Image src={partnerInteraction.user.avatarUrl} fill alt="Partner" className="object-cover" />}
                                </div>
                            </div>
                            <p className="text-[10px] md:text-xs text-zinc-300 italic line-clamp-2 leading-tight">"{partnerInteraction.review}"</p>
                        </div>
                    )}

                    {!myInteraction && (
                        <div className="text-center pt-1 md:pt-2 mt-auto">
                <span className="text-[10px] md:text-xs text-zinc-500 flex items-center justify-center gap-1 group-hover:text-violet-300 transition-colors">
                    <Plus size={10} className="md:w-3 md:h-3" /> Avaliar
                </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}