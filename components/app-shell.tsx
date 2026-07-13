"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/workspaces", label: "Workspaces", icon: "📁" },
    { href: "/reports", label: "Reports", icon: "📊" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    function handleNavClick() {
        setOpen(false);
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Topbar cuma muncul di mobile */}
            <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Buka menu"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-background"
                >
                    ☰
                </button>
                <span className="text-base font-semibold text-white">WorkOS</span>
            </div>

            <div className="flex">
                {/* Backdrop, cuma muncul pas drawer kebuka di mobile */}
                {open && (
                    <div
                        className="fixed inset-0 z-40 bg-black/60 md:hidden"
                        onClick={() => setOpen(false)}
                    />
                )}

                {/* Sidebar: fixed+overlay di mobile, sticky normal di desktop (md ke atas) */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface p-4 transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-screen md:w-56 md:shrink-0 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="mb-8 flex items-center justify-between px-2">
                        <span className="text-lg font-semibold text-white">WorkOS</span>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Tutup menu"
                            className="text-muted hover:text-white md:hidden"
                        >
                            ✕
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const active = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={handleNavClick}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${active
                                            ? "bg-background text-white"
                                            : "text-muted hover:bg-background hover:text-white"
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-background hover:text-red-400"
                    >
                        🚪 Logout
                    </button>
                </aside>

                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}