import { create } from 'zustand';

import type { Block, CycleState, LeverageBlock, Phase, PlanStep } from '@/types';
import { generateId } from '@/utils';

type CycleStore = {
  cycle: CycleState;
  setPhase: (phase: Phase) => void;
  setPlanStep: (step: PlanStep) => void;
  setGoal: (goal: Block | null) => void;
  setTasks: (tasks: Block[]) => void;
  setBacklog: (backlog: Block[]) => void;
  setMemos: (memos: Block[]) => void;
  setKeeps: (keeps: LeverageBlock[]) => void;
  setTries: (tries: LeverageBlock[]) => void;
  addKeep: (keep: LeverageBlock) => void;
  addTry: (tryItem: LeverageBlock) => void;
  removeKeep: (id: string) => void;
  removeTry: (id: string) => void;
  updateKeepTiming: (id: string, timing: 'before' | 'during' | 'after') => void;
  updateTryTiming: (id: string, timing: 'before' | 'during' | 'after') => void;
  setProbability: (probability: number) => void;
  resetCycle: () => void;
};

const createInitialCycle = (): CycleState => ({
  id: generateId(),
  phase: 'plan',
  planStep: 1,
  goal: null,
  tasks: [],
  backlog: [],
  memos: [],
  keeps: [],
  tries: [],
  probability: 50,
  createdAt: new Date(),
});

export const useCycleStore = create<CycleStore>((set) => ({
  cycle: createInitialCycle(),

  setPhase: (phase) =>
    set((state) => ({
      cycle: { ...state.cycle, phase },
    })),

  setPlanStep: (planStep) =>
    set((state) => ({
      cycle: { ...state.cycle, planStep },
    })),

  setGoal: (goal) =>
    set((state) => ({
      cycle: { ...state.cycle, goal },
    })),

  setTasks: (tasks) =>
    set((state) => ({
      cycle: { ...state.cycle, tasks },
    })),

  setBacklog: (backlog) =>
    set((state) => ({
      cycle: { ...state.cycle, backlog },
    })),

  setMemos: (memos) =>
    set((state) => ({
      cycle: { ...state.cycle, memos },
    })),

  setKeeps: (keeps) =>
    set((state) => ({
      cycle: { ...state.cycle, keeps },
    })),

  setTries: (tries) =>
    set((state) => ({
      cycle: { ...state.cycle, tries },
    })),

  addKeep: (keep) =>
    set((state) => ({
      cycle: { ...state.cycle, keeps: [...state.cycle.keeps, keep] },
    })),

  addTry: (tryItem) =>
    set((state) => ({
      cycle: { ...state.cycle, tries: [...state.cycle.tries, tryItem] },
    })),

  removeKeep: (id) =>
    set((state) => ({
      cycle: {
        ...state.cycle,
        keeps: state.cycle.keeps.filter((k) => k.id !== id),
      },
    })),

  removeTry: (id) =>
    set((state) => ({
      cycle: {
        ...state.cycle,
        tries: state.cycle.tries.filter((t) => t.id !== id),
      },
    })),

  updateKeepTiming: (id, timing) =>
    set((state) => ({
      cycle: {
        ...state.cycle,
        keeps: state.cycle.keeps.map((k) =>
          k.id === id ? { ...k, timing } : k
        ),
      },
    })),

  updateTryTiming: (id, timing) =>
    set((state) => ({
      cycle: {
        ...state.cycle,
        tries: state.cycle.tries.map((t) =>
          t.id === id ? { ...t, timing } : t
        ),
      },
    })),

  setProbability: (probability) =>
    set((state) => ({
      cycle: { ...state.cycle, probability },
    })),

  resetCycle: () =>
    set({
      cycle: createInitialCycle(),
    }),
}));
