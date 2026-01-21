import { create } from 'zustand';

import type { LeverageBlock } from '@/types';

type LeverageStore = {
  items: LeverageBlock[];
  add: (item: LeverageBlock) => void;
  archive: (id: string) => void;
  restore: (id: string) => void;
  remove: (id: string) => void;
  getByTiming: (timing: 'before' | 'during' | 'after') => LeverageBlock[];
  getActive: () => LeverageBlock[];
  getArchived: () => LeverageBlock[];
};

export const useLeverageStore = create<LeverageStore>((set, get) => ({
  items: [],

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
