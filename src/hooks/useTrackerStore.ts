"use client";

import { create } from "zustand";
import { SlotConfig, TrackerPreferences } from "@/lib/types/tracker";

interface TrackerState {
  // Current page (0-indexed)
  currentPage: number;

  // Modal state
  selectedVariantId: string | null;
  isModalOpen: boolean;

  // Highlight state (for navigating from missing cards)
  highlightedVariantId: string | null;

  // Preferences (local state before saving)
  preferences: TrackerPreferences;

  // Actions
  setCurrentPage: (page: number) => void;
  nextPage: (totalPages: number) => void;
  prevPage: () => void;
  openModal: (variantId: string) => void;
  closeModal: () => void;
  setPreferences: (preferences: Partial<TrackerPreferences>) => void;
  resetPage: () => void;
  highlightCard: (variantId: string) => void;
  clearHighlight: () => void;
}

export const useTrackerStore = create<TrackerState>((set) => ({
  // Initial state
  currentPage: 0,
  selectedVariantId: null,
  isModalOpen: false,
  highlightedVariantId: null,
  preferences: {
    slotConfig: "NINE" as SlotConfig,
    includePromos: false,
    includeReverseHolos: false,
  },

  // Actions
  setCurrentPage: (page) => set({ currentPage: page }),

  nextPage: (totalPages) =>
    set((state) => ({
      currentPage: Math.min(state.currentPage + 1, totalPages - 1),
    })),

  prevPage: () =>
    set((state) => ({
      currentPage: Math.max(state.currentPage - 1, 0),
    })),

  openModal: (variantId) =>
    set({
      selectedVariantId: variantId,
      isModalOpen: true,
    }),

  closeModal: () =>
    set({
      selectedVariantId: null,
      isModalOpen: false,
    }),

  setPreferences: (newPreferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...newPreferences },
      // Reset to first page when preferences change (card count may change)
      currentPage: 0,
    })),

  resetPage: () => set({ currentPage: 0 }),

  highlightCard: (variantId) => set({ highlightedVariantId: variantId }),

  clearHighlight: () => set({ highlightedVariantId: null }),
}));
