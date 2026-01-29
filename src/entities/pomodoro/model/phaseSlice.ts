import type { StateCreator } from 'zustand';

// Phase: Flow의 3단계 (Plan → Execute → Reflect)
export type Phase = 'plan' | 'execute' | 'reflect';

// PlanStep: Plan phase의 3단계 (목표 정의 → 목표 분할 → 목표 점검)
export type PlanStep = 1 | 2 | 3;

export type PhaseSlice = {
  phase: Phase;
  planStep: PlanStep;
  setPhase: (phase: Phase) => void;
  setPlanStep: (step: PlanStep) => void;
};

export const createPhaseSlice: StateCreator<PhaseSlice, [], [], PhaseSlice> = (set) => ({
  phase: 'plan',
  planStep: 1,

  setPhase: (phase) => set({ phase }),
  setPlanStep: (planStep) => set({ planStep }),
});
