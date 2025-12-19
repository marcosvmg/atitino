import { getTmdbDetails } from "@/lib/tmdb";
import { MovieForm } from "@/components/MovieForm";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PageProps {
    params: Promise<{
        type: string;
        id: string;
    }>;
}

export default async function AddMoviePage({ params }: PageProps) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const { type, id } = await params;
    const tmdbId = parseInt(id);
    const validType = type === "movie" || type === "tv" ? type : "movie";

    const tmdbData = await getTmdbDetails(tmdbId, validType);

    if (!tmdbData) {
        return <div className="min-h-screen flex items-center justify-center text-zinc-400">Título não encontrado.</div>;
    }

    const user = await prisma.user.findUnique({
        where: { username: (session.user as any).username }
    });

    let initialData = null;

    if (user) {
        const savedMovie = await prisma.movie.findUnique({
            where: { tmdbId_type: { tmdbId, type: validType } },
            include: {
                interactions: {
                    where: { userId: user.id }
                }
            }
        });

        if (savedMovie && savedMovie.interactions.length > 0) {
            const interaction = savedMovie.interactions[0];
            initialData = {
                rating: interaction.rating || 0,
                review: interaction.review || "",
                status: interaction.status || "WATCHED",
                watchedSeasons: interaction.watchedSeasons || [], // Passa as temporadas
            };
        }
    }

    return (
        <MovieForm
            data={tmdbData}
            type={validType}
            id={id}
            initialData={initialData}
        />
    );
}