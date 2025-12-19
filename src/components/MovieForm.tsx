"use client";

import { useState } from "react";
import { Star, Save, Trash2, ArrowLeft, Check, Eye, Bookmark, X, Upload, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import { saveMovieAction, deleteMovieAction } from "@/app/actions";
import { useRouter } from "next/navigation";

interface MovieFormProps {
    data: any;
    type: string;
    id: string;
    initialData: {
        rating: number;
        review: string;
        status: string;
        watchedSeasons: number[];
    } | null;
}

const STATUS_OPTIONS = [
    { id: "WATCHED", label: "Assistido", icon: Check, color: "bg-green-400 text-green-950" },
    // MUDANÇA: Violet-300 com texto escuro para contraste
    { id: "WATCHING", label: "Assistindo", icon: Eye, color: "bg-violet-300 text-violet-950" },
    { id: "PLAN", label: "Para Ver", icon: Bookmark, color: "bg-amber-300 text-amber-950" },
];

export function MovieForm({ data, type, id, initialData }: MovieFormProps) {
    const router = useRouter();

    const [rating, setRating] = useState(initialData?.rating || 0);
    const [status, setStatus] = useState(initialData?.status || "WATCHED");
    const [watchedSeasons, setWatchedSeasons] = useState<number[]>(initialData?.watchedSeasons || []);

    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isEditing = !!initialData;
    const title = data.title || data.name;
    const date = data.release_date || data.first_air_date;
    const posterUrl = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null;
    const backdropUrl = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null;

    const totalSeasons = data.number_of_seasons || 0;
    const seasonsArray = Array.from({ length: totalSeasons }, (_, i) => i + 1);

    const toggleSeason = (seasonNum: number) => {
        setWatchedSeasons(prev =>
            prev.includes(seasonNum)
                ? prev.filter(s => s !== seasonNum)
                : [...prev, seasonNum].sort((a, b) => a - b)
        );
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-6">

            <div className="fixed inset-0 z-0">
                {backdropUrl && (
                    <Image src={backdropUrl} alt="Background" fill className="object-cover opacity-20 blur-sm" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-4xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-20 md:hidden p-2 bg-black/50 rounded-full text-white"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="w-full md:w-1/3 relative min-h-[300px] md:min-h-full">
                    {posterUrl ? (
                        <Image src={posterUrl} alt={title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">Sem Imagem</div>
                    )}
                </div>

                <div className="flex-1 p-6 md:p-10 flex flex-col max-h-[90vh] overflow-y-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{title}</h1>
                        <p className="text-zinc-400 text-sm flex items-center gap-2">
                            {date?.split("-")[0]} • {type === "movie" ? "Filme" : "Série"}
                            {/* MUDANÇA: Badge Violet-300 (Texto claro pois o fundo é transparente/dark) */}
                            {isEditing && <span className="bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded text-xs border border-violet-500/20">Na Coleção</span>}
                        </p>
                    </div>

                    <form action={saveMovieAction} onSubmit={() => setIsSaving(true)} className="space-y-8">
                        <input type="hidden" name="tmdbId" value={id} />
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="title" value={title} />
                        <input type="hidden" name="overview" value={data.overview || ""} />
                        <input type="hidden" name="posterPath" value={data.poster_path || ""} />
                        <input type="hidden" name="backdropPath" value={data.backdrop_path || ""} />
                        <input type="hidden" name="releaseDate" value={date || ""} />
                        <input type="hidden" name="rating" value={rating} />
                        <input type="hidden" name="status" value={status} />
                        <input type="hidden" name="watchedSeasons" value={JSON.stringify(watchedSeasons)} />

                        {/* 1. STATUS */}
                        <div className="grid grid-cols-3 gap-3 bg-zinc-950/50 p-1 rounded-xl">
                            {STATUS_OPTIONS.map((opt) => {
                                const isSelected = status === opt.id;
                                // Extrai a classe de cor (ex: bg-violet-300) e a de texto
                                const colorClass = isSelected ? opt.color : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300";

                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setStatus(opt.id)}
                                        className={`flex flex-col items-center justify-center gap-2 py-3 rounded-lg transition-all ${colorClass} ${isSelected ? 'shadow-lg font-bold' : ''}`}
                                    >
                                        <opt.icon size={20} />
                                        <span className="text-xs">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 2. PROGRESSO */}
                        {type === "tv" && totalSeasons > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Temporadas Assistidas</label>
                                    <span className="text-xs text-zinc-500">{watchedSeasons.length} de {totalSeasons}</span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {seasonsArray.map((num) => {
                                        const isWatched = watchedSeasons.includes(num);
                                        return (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => toggleSeason(num)}
                                                // MUDANÇA: Fundo Violet-300 com Texto Escuro (Violet-950)
                                                className={`h-10 rounded-lg text-sm font-bold border transition-all ${
                                                    isWatched
                                                        ? "bg-violet-300 border-violet-300 text-violet-950 shadow-lg shadow-violet-500/10"
                                                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600"
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 3. NOTA */}
                        {status !== "PLAN" && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                                <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Sua Nota</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`transition-all hover:scale-110 ${
                                                star <= rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"
                                            }`}
                                        >
                                            <Star size={32} strokeWidth={1.5} fill={star <= rating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. REVIEW */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                                {status === "PLAN" ? "Anotações / Expectativa" : "Sua Análise"}
                            </label>
                            <textarea
                                name="review"
                                defaultValue={initialData?.review || ""}
                                placeholder={status === "PLAN" ? "Por que quer assistir?" : "O que você achou?"}
                                // Focus ring: Violet-300
                                className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl p-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-300/50 min-h-[100px] resize-none transition-all"
                            />
                        </div>

                        {/* 5. AÇÕES */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                // Botão principal branco ainda é o melhor contraste no modo escuro,
                                // mas podemos usar o violeta se preferir. Vou manter branco para elegância,
                                // mas o hover será violet-300.
                                className="flex-1 bg-zinc-100 text-black font-bold py-4 rounded-xl hover:bg-violet-300 hover:text-violet-950 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                            >
                                {isSaving ? "Salvando..." : (
                                    <>
                                        <Save size={20} />
                                        {isEditing ? "Salvar Alterações" : "Adicionar à Coleção"}
                                    </>
                                )}
                            </button>

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={isSaving}
                                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal permanece o mesmo */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-2"><Trash2 size={24} /></div>
                            <h3 className="text-xl font-bold text-white">Remover da coleção?</h3>
                            <p className="text-zinc-400 text-sm">Isso apagará sua nota, status e review.</p>
                            <div className="flex w-full gap-3 pt-4">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-medium">Cancelar</button>
                                <form action={deleteMovieAction} className="flex-1">
                                    <input type="hidden" name="tmdbId" value={id} />
                                    <input type="hidden" name="type" value={type} />
                                    <button type="submit" className="w-full py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium shadow-lg shadow-red-600/20">Sim, remover</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}