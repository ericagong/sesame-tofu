import { create } from 'zustand';

import type { Phase, PlanStep } from '@/entities/flow';
import type { Block } from '@/entities/block';
import type { Insight } from '@/entities/insight';
import { generateId } from '@/entities/block';

export type FlowStore = {
  // State
  id: string;
  phase: Phase;
  planStep: PlanStep;
  goal: Block | null;
  tasks: Block[];
  backlog: Block[];
  memos: Block[];
  insights: Insight[];
  probability: number;
  createdAt: Date;

  // Phase actions
  setPhase: (phase: Phase) => void;
  setPlanStep: (step: PlanStep) => void;

  // Blocks actions
  setGoal: (goal: Block | null) => void;
  setTasks: (tasks: Block[]) => void;
  setBacklog: (backlog: Block[]) => void;
  setMemos: (memos: Block[]) => void;

  // Insights actions
  setInsights: (insights: Insight[]) => void;
  addInsight: (insight: Insight) => void;
  removeInsight: (id: string) => void;
  toggleInsightStatus: (id: string) => void;
  updateInsightTiming: (id: string, timing: 'before' | 'during' | 'after') => void;

  // Meta actions
  setProbability: (probability: number) => void;
  resetFlow: () => void;
};

const createInitialState = () => ({
  id: generateId(),
  phase: 'plan' as Phase,
  planStep: 1 as PlanStep,
  goal: null,
  tasks: [],
  backlog: [],
  memos: [],
  insights: [],
  probability: 50,
  createdAt: new Date(),
});

export const useFlowStore = create<FlowStore>()((set) => ({
  // Initial state
  ...createInitialState(),

  // Phase actions
  setPhase: (phase) => set({ phase }),
  setPlanStep: (planStep) => set({ planStep }),

  // Blocks actions
  setGoal: (goal) => set({ goal }),
  setTasks: (tasks) => set({ tasks }),
  setBacklog: (backlog) => set({ backlog }),
  setMemos: (memos) => set({ memos }),

  // Insights actions
  setInsights: (insights) => set({ insights }),
  addInsight: (insight) =>
    set((state) => ({
      insights: [...state.insights, insight],
    })),
  removeInsight: (id) =>
    set((state) => ({
      insights: state.insights.filter((i) => i.id !== id),
    })),
  toggleInsightStatus: (id) =>
    set((state) => ({
      insights: state.insights.map((i) =>
        i.id === id
          ? { ...i, block: { ...i.block, status: i.block.status === 'active' ? 'deleted' : 'active' } }
          : i
      ),
    })),
  updateInsightTiming: (id, timing) =>
    set((state) => ({
      insights: state.insights.map((i) => (i.id === id ? { ...i, timing } : i)),
    })),

  // Meta actions
  setProbability: (probability) => set({ probability }),
  resetFlow: () => set(createInitialState()),
}));
