import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Estendemos a interface Session para incluir nossos campos personalizados
     * que retornamos no callback da sessão em auth.ts
     */
    interface Session {
        user: {
            id: string
            username: string
            avatarUrl?: string | null
        } & DefaultSession["user"]
    }

    /**
     * Estendemos a interface User para garantir que o objeto User
     * usado internamente também tenha esses campos
     */
    interface User {
        id: string
        username: string
        avatarUrl?: string | null
    }
}