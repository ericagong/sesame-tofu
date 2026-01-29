import { useState, useCallback } from 'react';
import type { Block } from '@/entities/block';
import type { PlanStep } from '@/entities/flow';

type UsePlanStepReturn = {
  planStep: PlanStep;
  setPlanStep: (step: PlanStep) => void;
  isStep1Done: boolean;
  isStep2Done: boolean;
  isStep3Done: boolean;
  canAccessStep: (step: PlanStep) => boolean;
  canGoNext: (allChecked: boolean) => boolean;
  handleNext: () => void;
  handleBack: () => void;
};

export const usePlanStep = (
  goal: Block | null,
  tasks: Block[],
  probability: number
): UsePlanStepReturn => {
  const [planStep, setPlanStep] = useState<PlanStep>(1);

  const isStep1Done = !!goal?.content;
  const isStep2Done = tasks.length > 0;
  const isStep3Done = probability >= 80;

  const canAccessStep = useCallback(
    (step: PlanStep): boolean => {
      if (step === 1) return true;
      if (step === 2) return isStep1Done;
      if (step === 3) return isStep1Done && isStep2Done;
      return false;
    },
    [isStep1Done, isStep2Done]
  );

  const canGoNext = useCallback(
    (allChecked: boolean): boolean => {
      switch (planStep) {
        case 1:
          return isStep1Done;
        case 2:
          return isStep2Done;
        case 3:
          return isStep3Done && allChecked;
        default:
          return false;
      }
    },
    [planStep, isStep1Done, isStep2Done, isStep3Done]
  );

  const handleNext = useCallback(() => {
    if (planStep < 3) {
      setPlanStep((planStep + 1) as PlanStep);
    }
  }, [planStep]);

  const handleBack = useCallback(() => {
    if (planStep > 1) {
      setPlanStep((planStep - 1) as PlanStep);
    }
  }, [planStep]);

  return {
    planStep,
    setPlanStep,
    isStep1Done,
    isStep2Done,
    isStep3Done,
    canAccessStep,
    canGoNext,
    handleNext,
    handleBack,
  };
};
