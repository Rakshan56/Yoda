"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Bookmark = {
  id: string;
  title: string;
  href: string;
  category: "pokemon" | "location" | "battle" | "guide";
  game?: string;
};

type BookmarkState = {
  bookmarks: Bookmark[];
  add: (bookmark: Bookmark) => void;
  remove: (id: string) => void;
};

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set) => ({
      bookmarks: [],
      add: (bookmark) => set((state) => ({ bookmarks: state.bookmarks.some((item) => item.id === bookmark.id) ? state.bookmarks : [...state.bookmarks, bookmark] })),
      remove: (id) => set((state) => ({ bookmarks: state.bookmarks.filter((item) => item.id !== id) }))
    }),
    { name: "yoda-bookmarks" }
  )
);
