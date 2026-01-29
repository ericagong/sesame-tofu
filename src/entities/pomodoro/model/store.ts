import { create } from 'zustand';

import { generateId } from '@/shared/lib/utils';
import type { Block, Insight, Phase } from './';

// PomodoroState: Pomodoro 전체 상태 (Flow + Rest)
export type PomodoroState = {
  id: string;
  phase: Phase;
  goal: Block | null;
  tasks: Block[];
  backlog: Block[];
  memos: Block[];
  insights: Insight[];
  probability: number;
  createdAt: Date;
};

type PomodoroStore = {
  // State
  id: string;
  phase: Phase;
  goal: Block | null;
  tasks: Block[];
  backlog: Block[];
  memos: Block[];
  insights: Insight[];
  probability: number;
  createdAt: Date;

  // Phase actions
  setPhase: (phase: Phase) => void;

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
  resetPomodoro: () => void;

  // Computed
  pomodoro: PomodoroState;
};

export const usePomodoroStore = create<PomodoroStore>()((set, get) => ({
  // Initial state
  id: generateId(),
  phase: 'plan',
  goal: null,
  tasks: [],
  backlog: [],
  memos: [],
  insights: [],
  probability: 50,
  createdAt: new Date(),

  // Phase actions
  setPhase: (phase) => set({ phase }),

  // Blocks actions
  setGoal: (goal) => set({ goal }),
  setTasks: (tasks) => set({ tasks }),
  setBacklog: (backlog) => set({ backlog }),
  setMemos: (memos) => set({ memos }),

  // Insights actions
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

  // Meta actions
  setProbability: (probability) => set({ probability }),
  resetPomodoro: () => set({
    id: generateId(),
    phase: 'plan',
    goal: null,
    tasks: [],
    backlog: [],
    memos: [],
    insights: [],
    probability: 50,
    createdAt: new Date(),
  }),

  // Computed getter
  get pomodoro(): PomodoroState {
    const state = get();
    return {
      id: state.id,
      phase: state.phase,
      goal: state.goal,
      tasks: state.tasks,
      backlog: state.backlog,
      memos: state.memos,
      insights: state.insights,
      probability: state.probability,
      createdAt: state.createdAt,
    };
  },
}));
