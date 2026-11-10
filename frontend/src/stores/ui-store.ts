"use client";

import { create } from "zustand";

type UiState = {
  sidebarOpen: boolean;
  selectedGame: string;
  toggleSidebar: () => void;
  setSelectedGame: (gameId: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  selectedGame: "emerald",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedGame: (selectedGame) => set({ selectedGame })
}));
