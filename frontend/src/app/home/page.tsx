"use client";

import Link from "next/link";
import { ArrowUpRight, Gamepad2, Moon, Sparkles, Sun } from "lucide-react";
import { useGames } from "@/hooks/use-game-content";
import { gamePath } from "@/lib/game-routes";
import { useThemeStore } from "@/stores/theme-store";

const cardDetails = {
  firered: {
    background: "from-orange-500 via-red-700 to-red-950",
    pokemon: "Charizard",
    artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    region: "Kanto"
  },
  leafgreen: {
    background: "from-lime-400 via-green-700 to-emerald-950",
    pokemon: "Venusaur",
    artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    region: "Kanto"
  },
  emerald: {
    background: "from-green-900 via-emerald-950 to-[#071b16]",
    pokemon: "Rayquaza",
    artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png",
    region: "Hoenn"
  },
  ruby: {
    background: "from-red-400 via-red-800 to-rose-950",
    pokemon: "Groudon",
    artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/383.png",
    region: "Hoenn"
  },
  sapphire: {
    background: "from-blue-400 via-blue-800 to-slate-950",
    pokemon: "Kyogre",
    artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/382.png",
    region: "Hoenn"
  }
} as const;

export default function HomePage() {
  const { data } = useGames();
  const { theme, toggleTheme } = useThemeStore();
  const games = data?.data ?? [];
  const displayGames = games.length ? games : [
    { id: "emerald", name: "Pokémon Emerald" },
    { id: "firered", name: "Pokémon FireRed" },
    { id: "leafgreen", name: "Pokémon LeafGreen" },
    { id: "ruby", name: "Pokémon Ruby" },
    { id: "sapphire", name: "Pokémon Sapphire" }
  ];

  return (
    <section className="home-landing relative min-h-screen overflow-hidden bg-[#090b0f] px-5 pb-10 text-white sm:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_80%,transparent)]" />
      <header className="relative z-10 mx-auto flex max-w-[1320px] items-center justify-between py-6">
        <Link href="/home" className="flex items-center gap-3"><img src="/yoda-icon.png" alt="Yoda" className="h-9 w-14 object-contain" /><span className="text-lg font-black">POKÉMON <span className="text-[9px] font-medium tracking-[.3em] text-muted">GAMES</span></span></Link>
        <nav className="hidden items-center gap-8 text-xs text-muted md:flex"><Link className="text-white" href="/games">•&nbsp; Games</Link><Link href="/pokedex">Pokémon</Link><Link href="/games">Walkthroughs</Link><Link href="/games">Battles</Link></nav>
        <div className="flex items-center gap-2">
          <button aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-muted transition hover:border-gold hover:text-white">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
          <Link href="/collection" className="rounded-full border border-white/15 px-4 py-2 text-xs text-muted transition hover:border-gold hover:text-white">▱&nbsp; My collection</Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl pt-12 text-center sm:pt-16">
        <p className="eyebrow flex items-center justify-center gap-2 text-[10px]"><Sparkles size={12} /> Small Pokémon. Endless possibilities.</p>
        <h1 className="mt-5 text-5xl font-black leading-[.94] tracking-[-.07em] sm:text-7xl lg:text-8xl">Big adventures.<br />Pokémon <span className="text-gold">magic.</span></h1>
        <p className="mx-auto mt-6 max-w-lg text-sm text-muted">Discover new worlds, find your partner, and write your own Pokémon story.</p>
        <Link href="/games" className="mt-7 inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-xs font-bold text-ink transition hover:scale-105">Explore games <ArrowUpRight size={15} /></Link>
      </div>

      <div className="home-card-viewport relative z-10 mx-auto mt-12 max-w-[1240px] overflow-hidden px-3 pt-10 pb-4 sm:mt-14 sm:pt-12">
        <div className="home-card-track flex w-max items-end">
        {[...displayGames, ...displayGames].map((game, index) => (
          (() => {
            const details = cardDetails[game.id as keyof typeof cardDetails] ?? cardDetails.emerald;
            return <Link key={`${game.id}-${index}`} href={gamePath(game.id as keyof typeof cardDetails)} className={`home-game-card group relative min-w-0 flex-1 rounded-[1.15rem] border border-white/20 bg-gradient-to-br ${details.background} p-4 shadow-2xl transition hover:z-20 hover:-translate-y-5 hover:scale-105 sm:p-5`} style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-start justify-between"><span className="text-[9px] font-semibold text-white/80">Pokémon</span><Gamepad2 size={15} className="text-white/80" /></div>
            <h2 className="mt-1 text-xl font-black leading-none sm:text-2xl">{game.name.replace("Pokémon ", "")}</h2>
            <div className="home-card-art mt-8 flex h-28 items-center justify-center sm:mt-10 sm:h-32"><img src={details.artwork} alt={details.pokemon} className="h-full w-full object-contain drop-shadow-[0_12px_12px_rgba(0,0,0,.4)] transition duration-500 group-hover:scale-110 group-hover:-rotate-3" /></div>
            <div className="mt-5 flex items-center justify-between text-[8px] uppercase tracking-[.2em] text-white/70"><span>{details.region} · RPG</span><span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-bold tracking-normal text-ink">Open guide <ArrowUpRight size={10} /></span></div>
          </Link>;
          })()
        ))}
        </div>
      </div>
    </section>
  );
}
