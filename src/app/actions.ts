"use server";

import { searchTmdb, TmdbSearchResult } from "@/lib/tmdb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // <--- Importando do Singleton agora
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { uploadImage } from "@/lib/cloudinary"; // <--- Novo import

// --- BUSCA FILMES ---
export async function searchMoviesAction(query: string): Promise<TmdbSearchResult[]> {
    try {
        const results = await searchTmdb(query);
        return results;
    } catch (error) {
        console.error("Erro na action de busca:", error);
        return [];
    }
}

// --- SALVAR FILME ---
export async function saveMovieAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Usuário não autenticado");

    const sessionUsername = (session.user as any).username;
    const user = await prisma.user.findUnique({ where: { username: sessionUsername } });

    if (!user) throw new Error("Usuário não encontrado");

    // Dados Básicos
    const tmdbId = parseInt(formData.get("tmdbId") as string);
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const overview = formData.get("overview") as string;
    const posterPath = formData.get("posterPath") as string;
    const backdropPath = formData.get("backdropPath") as string;
    const releaseDate = formData.get("releaseDate") as string;

    // Dados de Interação
    const rating = parseInt(formData.get("rating") as string) || 0;
    const review = formData.get("review") as string;
    const status = formData.get("status") as string;
    const seasonsJson = formData.get("watchedSeasons") as string;
    const watchedSeasons = seasonsJson ? JSON.parse(seasonsJson) : [];

    const movie = await prisma.movie.upsert({
        where: { tmdbId_type: { tmdbId, type } },
        update: {},
        create: { tmdbId, type, title, overview, posterPath, backdropPath, releaseDate },
    });

    await prisma.interaction.upsert({
        where: { userId_movieId: { userId: user.id, movieId: movie.id } },
        update: { rating, review, status, watchedSeasons, updatedAt: new Date() },
        create: { userId: user.id, movieId: movie.id, rating, review, status, watchedSeasons, watched: true },
    });

    redirect("/");
}

// --- DELETAR FILME ---
export async function deleteMovieAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Usuário não autenticado");

    const sessionUsername = (session.user as any).username;
    const user = await prisma.user.findUnique({ where: { username: sessionUsername } });

    if (!user) throw new Error("Usuário não encontrado");

    const tmdbId = parseInt(formData.get("tmdbId") as string);
    const type = formData.get("type") as string;

    const movie = await prisma.movie.findUnique({
        where: { tmdbId_type: { tmdbId, type } },
        include: { interactions: true }
    });

    if (!movie) return;

    try {
        await prisma.interaction.delete({
            where: { userId_movieId: { userId: user.id, movieId: movie.id } }
        });
    } catch (e) {}

    if (movie.interactions.length <= 1) {
        await prisma.movie.delete({ where: { id: movie.id } });
    }

    redirect("/");
}

// --- ATUALIZAR PERFIL (AGORA COM UPLOAD) ---
export async function updateUserAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Usuário não autenticado");

    const sessionUsername = (session.user as any).username;

    const newName = formData.get("name") as string;
    const newUsername = formData.get("username") as string;
    const newBio = formData.get("bio") as string;
    const newPassword = formData.get("password") as string;

    // Lógica de Imagem Híbrida (Arquivo ou URL)
    let finalAvatarUrl = formData.get("avatarUrl") as string; // Pega a URL se houver
    const avatarFile = formData.get("avatarFile") as File;     // Pega o arquivo se houver

    // Se o usuário enviou um arquivo, fazemos upload e ignoramos a URL digitada
    if (avatarFile && avatarFile.size > 0) {
        try {
            finalAvatarUrl = await uploadImage(avatarFile);
        } catch (error) {
            console.error("Erro no upload:", error);
            throw new Error("Falha ao fazer upload da imagem.");
        }
    }

    const updateData: any = {
        name: newName,
        username: newUsername,
        avatarUrl: finalAvatarUrl,
        bio: newBio,
    };

    if (newPassword && newPassword.trim() !== "") {
        updateData.password = await bcrypt.hash(newPassword, 10);
    }

    try {
        await prisma.user.update({
            where: { username: sessionUsername },
            data: updateData,
        });
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        throw new Error("Erro ao atualizar. Username pode estar em uso.");
    }

    redirect("/");
}