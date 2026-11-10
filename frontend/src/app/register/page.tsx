"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiRequestError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ display_name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setPending(true); setError("");
    try {
      const result = await apiFetch<{ access_token: string }>("/auth/register", { method: "POST", body: JSON.stringify({ display_name: form.display_name, email: form.email, password: form.password }) });
      window.localStorage.setItem("yoda_access_token", result.access_token);
      router.push("/home");
    } catch (reason) {
      setError(reason instanceof ApiRequestError ? reason.message : "Unable to create your account. Check the API connection and try again.");
    } finally { setPending(false); }
  };
  return <div className="mx-auto max-w-md py-10"><div className="mb-8 text-center"><p className="eyebrow">Join the club</p><h1 className="page-title mt-4 text-4xl">Start your adventure.</h1><p className="mt-4 text-sm leading-6 text-muted">Create an account to keep your progress and teams connected across sessions.</p></div><Card className="p-6"><form className="space-y-4" onSubmit={submit}>{[["display_name", "Trainer name", "text"], ["email", "Email", "email"], ["password", "Password", "password"], ["confirm", "Confirm password", "password"]].map(([key, label, type]) => <label className="block text-xs font-semibold text-muted" key={key}><span className="mb-2 block">{label}</span><input required minLength={key === "password" || key === "confirm" ? 12 : undefined} type={type} value={form[key as keyof typeof form]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-sm outline-none focus:border-gold" /></label>)}{error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200">{error}</p>}<Button className="w-full" disabled={pending}>{pending ? "Creating account..." : "Create account"}</Button><p className="text-center text-xs text-muted">Already registered? <Link href="/login" className="font-semibold text-gold">Sign in</Link></p></form></Card></div>;
}
