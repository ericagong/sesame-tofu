// Phase: Flow의 3단계 (Plan → Execute → Reflect)
export type Phase = 'plan' | 'execute' | 'reflect';

// PlanStep: Plan phase의 3단계 (목표 정의 → 목표 분할 → 목표 점검)
export type PlanStep = 1 | 2 | 3;

// FlowState: Flow 전체 상태 (타입만 정의, store는 features/flow에서)
export type FlowState = {
  id: string;
  phase: Phase;
  planStep: PlanStep;
  probability: number;
  createdAt: Date;
};
