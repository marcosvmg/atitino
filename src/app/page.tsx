import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MovieSearch } from "@/components/MovieSearch";
import { MovieCard } from "@/components/MovieCard";
import { LogOut, Clapperboard, Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

interface MovieWithInteractions {
    id: string;
    tmdbId: number;
    type: string;
    title: string;
    posterPath: string | null;
    interactions: {
        rating: number | null;
        review: string | null;
        status: string;
        watchedSeasons: number[];
        user: {
            username: string;
            name: string | null;
            avatarUrl: string | null;
        };
    }[];
}

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const sessionUsername = (session.user as any).username;

    if (!sessionUsername) {
        redirect("/api/auth/signout");
    }

    const currentUser = await prisma.user.findUnique({
        where: { username: sessionUsername }
    });

    if (!currentUser) {
        redirect("/api/auth/signout");
    }

    const displayName = currentUser.name || session.user.name;
    const displayAvatar = currentUser.avatarUrl || session.user.avatarUrl;

    const movies = await prisma.movie.findMany({
        orderBy: { updatedAt: "desc" },
        include: { interactions: { include: { user: true } } },
    }) as unknown as MovieWithInteractions[];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
            <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40">
                {/* Ajuste: px-4 no mobile, px-6 no desktop */}
                <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg md:text-xl tracking-tighter">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
                            <Clapperboard size={18} />
                        </div>
                        <span className="hidden md:inline">Atitino</span>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-sm font-medium text-white hidden sm:inline">{displayName}</span>
                        <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-zinc-800">
                            {displayAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-violet-300 to-fuchsia-300 flex items-center justify-center text-violet-950 text-xs font-bold">
                                    {displayName?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <a href="/settings" className="ml-1 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all"><Settings size={18} /></a>
                        <a href="/api/auth/signout" className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"><LogOut size={18} /></a>
                    </div>
                </div>
            </header>

            {/* Ajuste: px-4 no mobile */}
            <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <section className="mb-12 md:mb-20 text-center space-y-6 md:space-y-8">
                    {/* Ajuste: Texto menor no mobile (text-3xl) */}
                    <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-white">
                        Coleção Privada
                    </h1>
                    <div className="pt-2">
                        <MovieSearch />
                    </div>
                </section>

                <section>
                    {movies.length > 0 ? (
                        // Ajuste: gap-3 no mobile (bem mais justo) e gap-6 no desktop
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                            {movies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} currentUsername={sessionUsername} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-zinc-900 border-dashed">
                            <p className="text-zinc-500">Nenhum filme na coleção ainda.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}