import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserCircle, Save, ArrowLeft, Key, AtSign, Link as LinkIcon, FileText, Upload } from "lucide-react";
import { updateUserAction } from "@/app/actions";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { username: (session.user as any).username },
    });
    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">

                <div className="p-8 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur flex items-center gap-4">
                    <a href="/" className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><ArrowLeft size={20} /></a>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Editar Perfil</h1>
                        <p className="text-zinc-400 text-sm">Personalize sua conta</p>
                    </div>
                </div>

                <div className="p-8">
                    <form action={updateUserAction} className="space-y-6">

                        <div className="flex justify-center mb-4">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-800 shadow-xl group bg-zinc-800">
                                {user.avatarUrl ? (
                                    <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
                                ) : (
                                    // Fundo Violet-300 com texto escuro
                                    <div className="w-full h-full bg-violet-300 flex items-center justify-center text-violet-950 text-2xl font-bold">
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 space-y-4">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2 mb-2"><Upload size={16} /> Foto de Perfil</label>

                            <div className="space-y-2">
                                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Opção A: Enviar do Computador</span>
                                {/* MUDANÇA: Botão file bg-violet-300 text-violet-950 */}
                                <input
                                    type="file"
                                    name="avatarFile"
                                    accept="image/*"
                                    className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-300 file:text-violet-950 hover:file:bg-violet-200 cursor-pointer transition-all"
                                />
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-zinc-800"></div>
                                <span className="flex-shrink mx-4 text-zinc-600 text-xs">OU</span>
                                <div className="flex-grow border-t border-zinc-800"></div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Opção B: Link da Internet</span>
                                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3">
                                    <LinkIcon size={16} className="text-zinc-500" />
                                    <input name="avatarUrl" type="text" defaultValue={user.avatarUrl || ""} placeholder="https://..." className="w-full bg-transparent p-3 text-white focus:outline-none text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><UserCircle size={16} /> Nome de Exibição</label>
                            <input name="name" type="text" defaultValue={user.name || ""} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-300/50 transition-all" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><AtSign size={16} /> Username (Login)</label>
                            <input name="username" type="text" defaultValue={user.username} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-300/50 transition-all" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><FileText size={16} /> Bio</label>
                            <textarea name="bio" defaultValue={user.bio || ""} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-300/50 resize-none h-20 transition-all" />
                        </div>

                        <div className="border-t border-zinc-800 my-6"></div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Key size={16} /> Nova Senha (Opcional)</label>
                            <input name="password" type="password" placeholder="********" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-300/50 transition-all" />
                        </div>

                        <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-violet-300 hover:text-violet-950 transition-colors flex items-center justify-center gap-2 mt-8 shadow-lg">
                            <Save size={20} /> Salvar Alterações
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}