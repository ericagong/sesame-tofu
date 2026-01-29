import type { Phase, PlanStep } from '@/entities/flow';

// Phase 전환 순서
const PHASE_ORDER: Phase[] = ['plan', 'execute', 'reflect'];

// 다음 Phase 반환
export const getNextPhase = (current: Phase): Phase | null => {
  const index = PHASE_ORDER.indexOf(current);
  if (index === -1 || index === PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[index + 1];
};

// 이전 Phase 반환
export const getPrevPhase = (current: Phase): Phase | null => {
  const index = PHASE_ORDER.indexOf(current);
  if (index <= 0) return null;
  return PHASE_ORDER[index - 1];
};

// PlanStep 전환
export const getNextPlanStep = (current: PlanStep): PlanStep | null => {
  if (current >= 3) return null;
  return (current + 1) as PlanStep;
};

export const getPrevPlanStep = (current: PlanStep): PlanStep | null => {
  if (current <= 1) return null;
  return (current - 1) as PlanStep;
};
