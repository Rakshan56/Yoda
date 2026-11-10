"use client";

import { Bot, ChevronDown, MessageCircle, Plus, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCreateHelperConversation, useGame, useHelperConversations, useSendHelperMessage } from "@/hooks/use-game-content";
import { apiFetch } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";
import { GAME_IDS, type GameId } from "@/types/api";

const suggestions = ["Where can I find a Water Stone?", "What should I prepare for the next gym?", "Which Pokémon are available on this route?"];

export default function HelperPage() {
  const conversations = useHelperConversations();
  const create = useCreateHelperConversation();
  const [gameId, setGameId] = useState<GameId>("emerald");
  const [activeId, setActiveId] = useState<string>();
  const [content, setContent] = useState("");
  const active = conversations.data?.find((item) => item.id === activeId) ?? conversations.data?.[0];
  const send = useSendHelperMessage(active?.id ?? "");
  const submit = async (value = content) => {
    if (!value.trim()) return;
    let conversation = active;
    if (!conversation) {
      conversation = await create.mutateAsync({ game_id: gameId, title: value.slice(0, 60) });
      setActiveId(conversation.id);
    }
    if (active) {
      await send.mutateAsync(value.trim());
    } else {
      await apiFetch(`/helper/conversations/${conversation.id}/messages`, { method: "POST", body: JSON.stringify({ content: value.trim() }) });
      await conversations.refetch();
    }
    setContent("");
  };
  if (conversations.isLoading) return <LoadingState label="Loading helper conversations..." />;
  if (conversations.isError) return <ErrorState message={conversations.error.message} onRetry={() => conversations.refetch()} />;
  return <div className="space-y-8"><div><p className="eyebrow">Contextual guidance</p><h1 className="page-title">Guide helper</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Ask about your adventure and keep the conversation tied to a game version. Responses are limited to what the backend currently provides.</p></div><div className="grid gap-5 lg:grid-cols-[230px_1fr]"><Card className="p-3"><Button className="w-full" onClick={() => { setActiveId(undefined); setContent(""); }}><Plus size={16} /> New conversation</Button><p className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-widest text-muted">History</p><div className="space-y-1">{(conversations.data ?? []).map((conversation) => <button key={conversation.id} onClick={() => setActiveId(conversation.id)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-3 text-left text-xs ${active?.id === conversation.id ? "bg-gold text-ink" : "text-muted hover:bg-white/5 hover:text-white"}`}><MessageCircle size={14} /><span className="truncate">{conversation.title ?? "Untitled conversation"}</span></button>)}</div></Card><Card className="flex min-h-[560px] flex-col p-5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold"><Bot size={20} /></div><div><h2 className="font-bold">Adventure assistant</h2><p className="text-xs text-muted">Source-backed game context</p></div></div><label className="relative"><span className="sr-only">Game context</span><select value={gameId} onChange={(event) => setGameId(event.target.value as GameId)} className="h-9 appearance-none rounded-lg border border-line bg-white/[0.03] px-3 pr-8 text-xs capitalize text-white outline-none"><option value="" disabled>Game context</option>{GAME_IDS.map((id) => <option value={id} key={id}>{id}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted" size={14} /></label></div><div className="flex-1 space-y-3 overflow-y-auto py-5">{!active?.messages?.length ? <div className="flex h-full flex-col items-center justify-center text-center"><Sparkles className="text-gold" size={24} /><p className="mt-4 font-semibold text-white">What are you planning?</p><div className="mt-4 flex flex-wrap justify-center gap-2">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => void submit(suggestion)} className="rounded-full border border-line px-3 py-2 text-xs text-muted hover:border-gold hover:text-white">{suggestion}</button>)}</div></div> : active.messages.map((message) => <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-gold px-4 py-3 text-sm text-ink" : "max-w-[80%] rounded-2xl rounded-bl-sm bg-white/[0.05] px-4 py-3 text-sm leading-6 text-white"}>{message.content}</div>)}</div><form className="flex gap-2 border-t border-line pt-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}><input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Ask your guide..." className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white/[0.03] px-4 text-sm outline-none focus:border-gold" /><Button type="submit" disabled={send.isPending || create.isPending || !content.trim()}><Send size={16} /></Button></form></Card></div></div>;
}
