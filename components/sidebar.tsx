"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/workspaces", label: "Workspaces", icon: "📁" },
  { href: "/reports", label: "Reports", icon: "📊" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-surface p-4">
      <div className="mb-8 px-2 text-lg font-semibold text-white">WorkOS</div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}