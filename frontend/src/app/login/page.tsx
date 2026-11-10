"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight, CircleHelp, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiRequestError } from "@/lib/api-client";
import { useThemeStore } from "@/stores/theme-store";

const pokemonArt = [
  ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/384.gif", "bottom-[-1rem] left-[-1rem] w-52 [image-rendering:pixelated] sm:left-6 sm:w-64"],
  ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/448.gif", "left-[-1rem] top-28 w-28 sm:left-8 sm:w-36"],
  ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/1.gif", "left-[20%] top-16 w-24 sm:w-28"],
  ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/7.gif", "right-[21%] top-28 w-24 sm:w-28"],
  ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/445.gif", "right-[-1rem] top-28 w-32 sm:right-8 sm:w-40"],
  ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/133.gif", "bottom-44 left-[24%] w-28 sm:left-[27%] sm:w-32"]
  ,["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/6.gif", "right-[10%] bottom-36 w-36 sm:w-44"]
  ,["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif", "right-[29%] bottom-[-1rem] w-28 sm:w-36"]
  ,["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/94.gif", "right-[-1rem] bottom-[-1rem] w-40 sm:w-48"]
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await apiFetch<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      window.localStorage.setItem("yoda_access_token", result.access_token);
      if (remember) window.localStorage.setItem("yoda_remember_login", "true");
      router.push("/home");
    } catch (reason) {
      setError(reason instanceof ApiRequestError ? reason.message : "Unable to sign in. Check the API connection and try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={`login-page relative flex min-h-screen flex-col overflow-hidden bg-[#090b0f] text-white ${theme === "light" ? "theme-light" : ""}`}>
      <header className="relative z-20 flex h-20 items-center justify-between border-b border-white/[0.04] bg-[#0b0d12] px-6 sm:px-12">
        <Link href="/login" className="flex items-center gap-3">
          <img src="/yoda-icon.png" alt="Yoda" className="h-10 w-14 object-contain" />
          <span className="text-sm font-black uppercase tracking-wide">Pokémon<span className="block text-[8px] tracking-[0.3em] text-red-400">Trainer club</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <button type="button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme} className="rounded-lg p-2 text-muted transition hover:bg-white/5 hover:text-white">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
          <span className="hidden items-center gap-2 text-xs text-muted sm:flex"><CircleHelp size={14} /> Need a little help?</span>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_38%,rgba(27,113,91,.2),transparent_32%),radial-gradient(circle_at_86%_52%,rgba(134,67,50,.2),transparent_32%)]" />
        {pokemonArt.map(([src, position]) => <img key={src} src={src} alt="" aria-hidden="true" className={`pointer-events-none absolute z-0 hidden opacity-100 [image-rendering:pixelated] sm:block ${position}`} />)}
        <div className="relative z-10 w-full max-w-[360px] rounded-[1.4rem] border border-white/10 bg-[#1a1c22]/95 p-7 shadow-[0_24px_100px_rgba(0,0,0,.55)] backdrop-blur-md transition duration-200 focus-within:scale-[1.02] focus-within:border-red-400/60 focus-within:shadow-[0_28px_110px_rgba(239,68,68,.2)] sm:p-8">
          <p className="eyebrow flex items-center gap-2 text-[10px] text-red-400"><span>✦</span> Your adventure continues</p>
          <h1 className="mt-4 text-3xl font-black leading-[1.05] tracking-tight sm:text-[2.1rem]">Welcome back,<br />Trainer! <span className="text-red-400">✦</span></h1>
          <p className="mt-4 text-xs leading-5 text-muted">Your Pokémon journey is right where you left it. Sign in and let’s keep exploring.</p>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block text-[11px] font-medium text-white"><span className="mb-2 block">Email or Trainer username</span><div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ash.ketchum" className="h-10 w-full rounded-lg border border-line bg-[#111319] pl-9 pr-3 text-xs outline-none transition focus:border-red-400" /></div></label>
            <label className="block text-[11px] font-medium text-white"><span className="mb-2 block">Password</span><div className="relative"><LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input required minLength={12} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 w-full rounded-lg border border-line bg-[#111319] pl-9 pr-10 text-xs outline-none transition focus:border-red-400" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
            <div className="flex items-center justify-between text-[10px]"><label className="flex items-center gap-2 text-muted"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="accent-red-500" /> Remember me</label><button type="button" className="text-red-400">Forgot password?</button></div>
            {error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200">{error}</p>}
            <button disabled={pending} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-500 text-xs font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Signing in..." : "Let’s go, Trainer"} <ArrowRight size={15} /></button>
          </form>
          <div className="my-5 flex items-center gap-3 text-[10px] text-muted"><span className="h-px flex-1 bg-line" />or continue with<span className="h-px flex-1 bg-line" /></div>
          <div className="grid grid-cols-2 gap-2"><button type="button" disabled className="h-9 rounded-lg border border-line text-[10px] text-muted">G&nbsp;&nbsp; Google</button><button type="button" disabled className="h-9 rounded-lg border border-line text-[10px] text-muted">▣&nbsp;&nbsp; Nintendo</button></div>
          <p className="mt-5 text-center text-[10px] text-muted">New to the club? <Link href="/register" className="font-semibold text-red-400">Create an account</Link></p>
        </div>
      </main>
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.04] bg-[#0b0d12] px-6 py-5 text-[10px] text-muted sm:px-12"><span>© 2026 Pokémon. All adventures welcome.</span><span className="flex gap-4"><span>Privacy policy</span><span>Terms of use</span><span>◎ English⌄</span></span></footer>
    </div>
  );
}
