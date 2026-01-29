import { useState, useCallback } from 'react';

import type { PlanStep } from '@/entities/flow';
import { generateId } from '@/entities/block';
import { GuideMessage, PhaseNavigation, Tabs } from '@/shared/primitives';
import { useFlowStore } from '../model/store';
import { useInsightsStore } from '@/features/insights';
import { usePlanStep } from '../model/usePlanStep';
import { useVisualization } from '../model/useVisualization';
import { PlanStep1, PlanStep2, PlanStep3 } from './PlanSteps';

const tabs: { step: PlanStep; label: string }[] = [
  { step: 1, label: '목표 정의' },
  { step: 2, label: '목표 분할' },
  { step: 3, label: '목표 점검' },
];

const guideMessages: Record<PlanStep | 'visualizing', string> = {
  1: '이번 Flow를 통해 달성할 목표를 한 문장으로 정의해주세요.',
  2: '목표 상태를 달성하기 위해 3가지의 작업으로 분할해주세요. 작업은 완결 상태로 정의해주세요.',
  3: '실행 가능성을 점검하고, 과제 순서를 드래그해서 조정하세요.',
  visualizing:
    '지금 적은 과제들을 순차적으로 완벽히 처리하는 자신의 모습을 눈을 감고 시각화해보세요. 어떤 기분이 드나요?',
};

export const PlanView = () => {
  // Flow store
  const goal = useFlowStore((s) => s.goal);
  const tasks = useFlowStore((s) => s.tasks);
  const backlog = useFlowStore((s) => s.backlog);
  const probability = useFlowStore((s) => s.probability);
  const setGoal = useFlowStore((s) => s.setGoal);
  const setTasks = useFlowStore((s) => s.setTasks);
  const setBacklog = useFlowStore((s) => s.setBacklog);
  const setProbability = useFlowStore((s) => s.setProbability);
  const setPhase = useFlowStore((s) => s.setPhase);
  const { getByTiming } = useInsightsStore();

  // Custom hooks
  const {
    planStep,
    setPlanStep,
    isStep1Done,
    isStep3Done,
    canAccessStep,
    canGoNext,
    handleNext,
    handleBack,
  } = usePlanStep(goal, tasks, probability);

  const { isVisualizing, countdown, startVisualization } = useVisualization(
    useCallback(() => setPhase('execute'), [setPhase])
  );

  // Local state for insight checklist
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const beforeInsights = getByTiming('before');

  function allChecked() {
    return (
      beforeInsights.length === 0 ||
      beforeInsights.every((i) => checkedIds.has(i.id))
    );
  }

  const handleTabClick = (step: PlanStep) => {
    if (canAccessStep(step)) {
      setPlanStep(step);
    }
  };

  const handleGoalChange = (value: string) => {
    setGoal({
      id: goal?.id || generateId(),
      content: value,
      depth: 0,
      status: 'active',
    });
  };

  const handleGoalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isStep1Done && planStep === 1) {
      setPlanStep(2);
    }
  };

  const toggleCheck = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIds(next);
  };

  const handleNextOrVisualize = () => {
    if (planStep < 3) {
      handleNext();
    } else if (isStep3Done && allChecked()) {
      startVisualization();
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={String(planStep)}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.step}
              value={String(tab.step)}
              disabled={!canAccessStep(tab.step)}
              onClick={() => handleTabClick(tab.step)}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>

      <GuideMessage>
        {isVisualizing ? guideMessages.visualizing : guideMessages[planStep]}
      </GuideMessage>

      {planStep === 1 && (
        <PlanStep1
          goal={goal}
          onGoalChange={handleGoalChange}
          onGoalKeyDown={handleGoalKeyDown}
          backlog={backlog}
          onBacklogChange={setBacklog}
        />
      )}

      {planStep === 2 && (
        <PlanStep2 goal={goal} tasks={tasks} onTasksChange={setTasks} />
      )}

      {planStep === 3 && (
        <PlanStep3
          goal={goal}
          tasks={tasks}
          onTasksChange={setTasks}
          backlog={backlog}
          onBacklogChange={setBacklog}
          probability={probability}
          onProbabilityChange={setProbability}
          beforeInsights={beforeInsights}
          checkedIds={checkedIds}
          onToggle={toggleCheck}
          isVisualizing={isVisualizing}
          countdown={countdown}
          isStep3Done={isStep3Done}
        />
      )}

      {!isVisualizing && (
        <PhaseNavigation
          onBack={handleBack}
          onNext={handleNextOrVisualize}
          hideBack={planStep <= 1}
          hideNext={!canGoNext(allChecked())}
        />
      )}
    </div>
  );
};
