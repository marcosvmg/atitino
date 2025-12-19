import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        username: credentials.username,
                    },
                });

                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    return null;
                }

                // Retornamos o objeto completo do usuário para ser usado nos callbacks
                return {
                    id: user.id,
                    name: user.name,
                    username: user.username, // Importante passar isso
                    avatarUrl: user.avatarUrl,
                } as any;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        // 1. Passa os dados do Login para o Token
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.avatarUrl = user.avatarUrl;
            }
            return token;
        },
        // 2. Passa os dados do Token para a Sessão (que usamos no front)
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
                session.user.username = token.username; // Agora session.user.username existe!
                session.user.avatarUrl = token.avatarUrl;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};