import { useCycleStore } from '@/stores/cycleStore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { GoalDefine } from './GoalDefine';
import { GoalBreakdown } from './GoalBreakdown';
import { GoalCheck } from './GoalCheck';
import { GoalVisualize } from './GoalVisualize';

import type { PlanStep } from '@/types';

const tabs: { step: PlanStep; label: string }[] = [
  { step: 1, label: '목표 정의' },
  { step: 2, label: '목표 분할' },
  { step: 3, label: '목표 점검' },
  { step: 4, label: '목표 시각화' },
];

export const PlanPhase = () => {
  const { cycle, setPlanStep } = useCycleStore();

  // 각 단계 완료 여부 확인
  const isStepCompleted = (step: PlanStep): boolean => {
    switch (step) {
      case 1:
        return !!cycle.goal?.content;
      case 2:
        return cycle.tasks.length > 0;
      case 3:
        return cycle.probability >= 80;
      case 4:
        return false;
      default:
        return false;
    }
  };

  // 해당 단계에 접근 가능한지 (이전 단계들이 모두 완료됐는지)
  const canAccessStep = (step: PlanStep): boolean => {
    if (step === 1) return true;
    for (let i = 1; i < step; i++) {
      if (!isStepCompleted(i as PlanStep)) {
        return false;
      }
    }
    return true;
  };

  const handleTabClick = (step: PlanStep) => {
    if (canAccessStep(step)) {
      setPlanStep(step);
    }
  };

  const renderContent = () => {
    switch (cycle.planStep) {
      case 1:
        return <GoalDefine />;
      case 2:
        return <GoalBreakdown />;
      case 3:
        return <GoalCheck />;
      case 4:
        return <GoalVisualize />;
      default:
        return <GoalDefine />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={String(cycle.planStep)} className="w-full">
        <TabsList className="w-full justify-start">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.step}
              value={String(tab.step)}
              disabled={!canAccessStep(tab.step)}
              onClick={() => handleTabClick(tab.step)}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {renderContent()}
    </div>
  );
};
