"use client";

import Link from "next/link";
import { Bookmark as BookmarkIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useBookmarkStore } from "@/stores/bookmark-store";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/query-state";

export default function BookmarksPage() {
  const { bookmarks, remove } = useBookmarkStore();
  const [filter, setFilter] = useState("");
  const items = bookmarks.filter((bookmark) => !filter || bookmark.title.toLowerCase().includes(filter.toLowerCase()));
  return <div className="space-y-8"><div><p className="eyebrow">Saved for later</p><h1 className="page-title">Bookmarks</h1><p className="mt-3 text-sm text-muted">Personal shortcuts saved in this browser. The backend does not currently expose a bookmark endpoint.</p></div><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter bookmarks..." className="h-11 w-full rounded-xl border border-line bg-panel px-4 text-sm outline-none focus:border-gold" />{!items.length ? <EmptyState title="No bookmarks yet" description="Save guide pages here when bookmark actions are added to content views." /> : <div className="grid gap-4 md:grid-cols-2">{items.map((bookmark) => <Card className="flex items-start gap-4 p-5" key={bookmark.id}><BookmarkIcon className="mt-1 text-gold" size={19} /><div className="min-w-0 flex-1"><Link href={bookmark.href} className="font-bold text-white hover:text-gold">{bookmark.title}</Link><p className="mt-1 text-xs capitalize text-muted">{bookmark.category}{bookmark.game ? ` · ${bookmark.game}` : ""}</p></div><button aria-label={`Remove ${bookmark.title}`} onClick={() => remove(bookmark.id)} className="text-muted hover:text-red-300"><Trash2 size={16} /></button></Card>)}</div>}</div>;
}
