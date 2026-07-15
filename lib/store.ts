"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type AppTheme, PERSIST_STORAGE_KEY } from "./theme";

export type { AppTheme };

const MAX_FAVORITES = 5;

function generateDeviceId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type Store = {
  displayAdditionalInfo: boolean;
  selectedPrimaryDetail: "ac" | "psg";
  theme: AppTheme;
  favoriteStopIds: number[];
  deviceId: string;
  showRegionalOperators: boolean;
  toggleDisplayAdditionalInfo: () => void;
  setSelectedPrimaryDetail: (detail: "ac" | "psg") => void;
  toggleTheme: () => void;
  addFavorite: (stopId: number) => void;
  removeFavorite: (stopId: number) => void;
  isFavorite: (stopId: number) => boolean;
  setShowRegionalOperators: (v: boolean) => void;
};

type PersistedStore = Partial<Store> & { mapTheme?: AppTheme };

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      displayAdditionalInfo: true,
      selectedPrimaryDetail: "ac",
      theme: "dark",
      favoriteStopIds: [],
      deviceId: generateDeviceId(),
      showRegionalOperators: false,
      toggleDisplayAdditionalInfo: () =>
        set((state) => ({ displayAdditionalInfo: !state.displayAdditionalInfo })),
      setSelectedPrimaryDetail: (detail) =>
        set(() => ({ selectedPrimaryDetail: detail })),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),
      addFavorite: (stopId) =>
        set((state) => {
          if (state.favoriteStopIds.includes(stopId)) return state;
          const next = [stopId, ...state.favoriteStopIds].slice(0, MAX_FAVORITES);
          return { favoriteStopIds: next };
        }),
      removeFavorite: (stopId) =>
        set((state) => ({
          favoriteStopIds: state.favoriteStopIds.filter((id) => id !== stopId),
        })),
      isFavorite: (stopId) => get().favoriteStopIds.includes(stopId),
      setShowRegionalOperators: (v) => set({ showRegionalOperators: v }),
    }),
    {
      name: PERSIST_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => {
        const state = persisted as PersistedStore;
        const migrated = { ...state };
        if (state.mapTheme && !state.theme) {
          migrated.theme = state.mapTheme;
          delete migrated.mapTheme;
        }
        if (!state.deviceId) {
          migrated.deviceId = generateDeviceId();
        }
        return migrated;
      },
    }
  )
);
