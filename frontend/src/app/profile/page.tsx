"use client";

import Link from "next/link";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-game-content";
import { apiFetch } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/shared/query-state";

export default function ProfilePage() {
  const user = useCurrentUser();
  const router = useRouter();
  const logout = async () => { await apiFetch("/auth/logout", { method: "POST" }); window.localStorage.removeItem("yoda_access_token"); router.push("/login"); };
  if (user.isLoading) return <LoadingState label="Loading profile..." />;
  if (user.isError) return <ErrorState message={user.error.message} onRetry={() => user.refetch()} />;
  if (!user.data) return <ErrorState message="Your account could not be loaded." />;
  return <div className="mx-auto max-w-3xl space-y-8"><div><p className="eyebrow">Your account</p><h1 className="page-title">Profile</h1><p className="mt-3 text-sm text-muted">Manage the account identity used to save your adventure data.</p></div><Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center"><div className="grid h-20 w-20 place-items-center rounded-2xl bg-gold text-3xl font-black text-ink">{user.data.display_name.slice(0, 1).toUpperCase()}</div><div><h2 className="text-xl font-bold text-white">{user.data.display_name}</h2><p className="mt-1 text-sm text-muted">{user.data.email}</p><span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-1 text-xs font-semibold text-emerald"><ShieldCheck size={13} /> {user.data.role}</span></div></Card><Card className="p-6"><div className="flex items-center gap-3"><UserRound className="text-gold" size={19} /><h2 className="font-bold">Account settings</h2></div><p className="mt-4 text-sm leading-6 text-muted">Profile editing preferences are not exposed by the current backend contract. Your account information above is read directly from the authenticated session.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/bookmarks"><Button variant="secondary">Open bookmarks</Button></Link><Button variant="ghost" onClick={() => void logout}><LogOut size={15} /> Sign out</Button></div></Card></div>;
}
