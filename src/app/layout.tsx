import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Atitino",
    description: "Curadoria privada de cinema & séries.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
        <body className="antialiased bg-zinc-950 text-zinc-100">
        {children}
        </body>
        </html>
    );
}