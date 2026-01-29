import type { PlanStep } from '@/entities/flow';
import { isStep1Done, isStep2Done, isStep3Done } from '../model/selectors';
import type { Block } from '@/entities/block';

type FlowState = {
  goal: Block | null;
  tasks: Block[];
  probability: number;
};

// PlanStep 접근 가능 여부
export const canAccessPlanStep = (step: PlanStep, state: FlowState): boolean => {
  switch (step) {
    case 1:
      return true;
    case 2:
      return isStep1Done(state.goal);
    case 3:
      return isStep1Done(state.goal) && isStep2Done(state.tasks);
    default:
      return false;
  }
};

// 다음 단계로 이동 가능 여부
export const canGoNextStep = (
  step: PlanStep,
  state: FlowState,
  allInsightsChecked: boolean
): boolean => {
  switch (step) {
    case 1:
      return isStep1Done(state.goal);
    case 2:
      return isStep2Done(state.tasks);
    case 3:
      return isStep3Done(state.probability) && allInsightsChecked;
    default:
      return false;
  }
};

// Execute → Reflect 전환 가능 여부 (항상 가능)
export const canGoToReflect = (): boolean => {
  return true;
};

// Reflect → Rest 전환 가능 여부 (모든 메모 분류 필요)
export const canGoToRest = (memos: Block[]): boolean => {
  return memos.filter((m) => m.status === 'active').length === 0;
};
