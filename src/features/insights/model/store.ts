import { create } from 'zustand';
import type { Insight, InsightTiming } from '@/entities/insight';

type InsightsStore = {
  // State
  items: Insight[];

  // Actions
  add: (item: Insight) => void;
  archive: (id: string) => void;
  restore: (id: string) => void;
  remove: (id: string) => void;

  // Getters
  getByTiming: (timing: InsightTiming) => Insight[];
  getActive: () => Insight[];
  getArchived: () => Insight[];
};

export const useInsightsStore = create<InsightsStore>((set, get) => ({
  // Initial state
  items: [],

  // Actions
  add: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  archive: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, status: 'archived' as const, archivedAt: new Date() }
          : item
      ),
    })),

  restore: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, status: 'active' as const, archivedAt: undefined }
          : item
      ),
    })),

  remove: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  // Getters
  getByTiming: (timing) => {
    return get().items.filter(
      (item) => item.timing === timing && item.status === 'active'
    );
  },

  getActive: () => {
    return get().items.filter((item) => item.status === 'active');
  },

  getArchived: () => {
    return get().items.filter((item) => item.status === 'archived');
  },
}));
