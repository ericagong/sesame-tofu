import type { StateCreator } from 'zustand';
import type { Block } from './blocksSlice';

// Insight - Reflect에서 생성되는 Block
export type Insight = {
  id: string;
  block: Block;
  timing: 'before' | 'during' | 'after';
  status: 'active' | 'archived';
  createdAt: Date;
  archivedAt?: Date;
};

export type InsightSlice = {
  insights: Insight[];
  setInsights: (insights: Insight[]) => void;
  addInsight: (insight: Insight) => void;
  removeInsight: (id: string) => void;
  toggleInsightStatus: (id: string) => void;
  updateInsightTiming: (id: string, timing: 'before' | 'during' | 'after') => void;
};

export const createInsightSlice: StateCreator<InsightSlice, [], [], InsightSlice> = (set) => ({
  insights: [],

  setInsights: (insights) => set({ insights }),

  addInsight: (insight) => set((state) => ({
    insights: [...state.insights, insight]
  })),

  removeInsight: (id) => set((state) => ({
    insights: state.insights.filter((i) => i.id !== id),
  })),

  toggleInsightStatus: (id) => set((state) => ({
    insights: state.insights.map((i) =>
      i.id === id
        ? { ...i, block: { ...i.block, status: i.block.status === 'active' ? 'deleted' : 'active' } }
        : i
    ),
  })),

  updateInsightTiming: (id, timing) => set((state) => ({
    insights: state.insights.map((i) => (i.id === id ? { ...i, timing } : i)),
  })),
});
