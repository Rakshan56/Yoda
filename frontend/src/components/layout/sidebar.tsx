"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Boxes, Gamepad2, LayoutGrid, Swords, Users, X, UserRound, Bookmark, FileText } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/games", label: "Adventure", icon: Gamepad2, match: "/games" },
  { href: "/pokedex", label: "Pokémon", icon: LayoutGrid, match: "/pokedex" },
  { href: "/games", label: "Walkthroughs", icon: BookOpen, action: "Choose a game to open walkthroughs" },
  { href: "/games", label: "Battles", icon: Swords, action: "Choose a game to open battles" },
  { href: "/teams", label: "Team builder", icon: Users },
  { href: "/collection", label: "Collection", icon: Boxes },
  { href: "/helper", label: "Guide helper", icon: BookOpen }
  ,{ href: "/profile", label: "Profile", icon: UserRound }
  ,{ href: "/bookmarks", label: "Bookmarks", icon: Bookmark }
  ,{ href: "/credits", label: "Credits", icon: FileText }
];

export function Sidebar({ variant = "default" }: { variant?: "default" | "home" }) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUiStore();

  return (
    <>
      <button aria-label="Close navigation" className={cn("fixed inset-0 z-40 bg-black/60 transition-opacity", !sidebarOpen && "pointer-events-none opacity-0")} onClick={toggleSidebar} />
      {!sidebarOpen && <button aria-label="Open navigation" onClick={toggleSidebar} className="fixed right-5 top-5 z-50 grid h-12 w-12 place-items-center rounded-full border-2 border-white/20 bg-white shadow-[0_8px_30px_rgba(0,0,0,.3)] transition hover:scale-110"><img src="/pokeball-home.png" alt="" className="h-9 w-9 rounded-full object-cover" /></button>}
      <aside className={cn(
        "app-sidebar fixed inset-y-0 z-50 flex w-[min(20rem,calc(100vw-1rem))] flex-col overflow-y-auto bg-[#101319] p-5 shadow-2xl transition-transform duration-300",
        "right-0 border-l border-line translate-x-full",
        sidebarOpen && "translate-x-0"
      )}>
        <div className="mb-12 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3" onClick={() => sidebarOpen && toggleSidebar()}>
            <img src="/yoda-icon.png" alt="Yoda" className="h-9 w-12 object-contain" />
            <span className="font-black tracking-tight text-white">YODA<span className="text-gold">.</span></span>
          </Link>
          <button aria-label="Close navigation" className="text-muted" onClick={toggleSidebar}><X size={20} /></button>
        </div>
        <Link href="/home" onClick={() => sidebarOpen && toggleSidebar()} className={cn("mb-6 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition", pathname === "/home" ? "bg-gold font-semibold text-ink" : "text-muted hover:bg-white/5 hover:text-white")}>
          <img src="/pokeball-home.png" alt="" className="h-7 w-7 rounded-full object-cover" />
          Home
        </Link>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Explore</p>
        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon, match, action }) => {
            const active = Boolean(match && (pathname === match || pathname.startsWith(`${match}/`)));
            return <Link key={label} href={href} title={action} onClick={() => sidebarOpen && toggleSidebar()} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition", active ? "bg-gold font-semibold text-ink" : "text-muted hover:bg-white/5 hover:text-white")}><Icon size={18} />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-line bg-white/[0.03] p-4">
          <p className="text-xs font-semibold text-white">Your adventure awaits</p>
          <p className="mt-1 text-xs leading-5 text-muted">Pick a game and make progress your way.</p>
          <Link className="mt-3 inline-block text-xs font-semibold text-gold" href="/games">Choose a game →</Link>
        </div>
      </aside>
    </>
  );
}
