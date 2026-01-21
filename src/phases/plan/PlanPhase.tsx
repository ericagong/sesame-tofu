import { useState, useEffect } from 'react';
import { useCycleStore } from '@/stores/cycleStore';
import { useLeverageStore } from '@/stores/leverageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlockEditor } from '@/components/editors';
import { Slider } from '@/components/ui/slider';
import {
  GoalSection,
  BacklogSection,
  LeverageCheckList,
} from '@/components/sections';
import { VisualizationOverlay } from '@/components/dialogs';
import { GuideMessage, PhaseNavigation, SectionLabel, DimmedSection } from '@/components/common';
import { generateId } from '@/utils';
import { cn } from '@/lib/utils';

import type { PlanStep } from '@/types';

const tabs: { step: PlanStep; label: string }[] = [
  { step: 1, label: '목표 정의' },
  { step: 2, label: '목표 분할' },
  { step: 3, label: '목표 점검' },
];

export const PlanPhase = () => {
  const {
    cycle,
    setGoal,
    setTasks,
    setBacklog,
    setProbability,
    setPlanStep,
    setPhase,
  } = useCycleStore();
  const { getByTiming } = useLeverageStore();

  const [isVisualizing, setIsVisualizing] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const beforeLeverages = getByTiming('before');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const allChecked =
    beforeLeverages.length === 0 ||
    beforeLeverages.every((l) => checkedIds.has(l.id));

  // 각 단계 완료 여부
  const isStep1Done = !!cycle.goal?.content;
  const isStep2Done = cycle.tasks.length > 0;
  const isStep3Done = cycle.probability >= 80;

  // 해당 단계에 접근 가능한지
  const canAccessStep = (step: PlanStep): boolean => {
    if (step === 1) return true;
    if (step === 2) return isStep1Done;
    if (step === 3) return isStep1Done && isStep2Done;
    return false;
  };

  const handleTabClick = (step: PlanStep) => {
    if (canAccessStep(step)) {
      setPlanStep(step);
    }
  };

  const handleGoalChange = (value: string) => {
    setGoal({
      id: cycle.goal?.id || generateId(),
      content: value,
      depth: 0,
      status: 'active',
    });
  };

  const handleGoalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isStep1Done && cycle.planStep === 1) {
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

  const startVisualization = () => {
    if (isStep3Done && allChecked) {
      setIsVisualizing(true);
    }
  };

  // 시각화 카운트다운 → 0이 되면 Execute로 이동
  useEffect(() => {
    if (!isVisualizing) return;

    if (countdown <= 0) {
      setPhase('execute');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isVisualizing, countdown, setPhase]);

  const handleNext = () => {
    if (cycle.planStep < 3) {
      setPlanStep((cycle.planStep + 1) as PlanStep);
    }
  };

  const handleBack = () => {
    if (cycle.planStep > 1) {
      setPlanStep((cycle.planStep - 1) as PlanStep);
    }
  };

  const canGoNext = () => {
    switch (cycle.planStep) {
      case 1:
        return isStep1Done;
      case 2:
        return isStep2Done;
      case 3:
        return isStep3Done && allChecked;
      default:
        return false;
    }
  };

  // 현재 단계의 가이드 메시지
  const getGuideMessage = () => {
    if (isVisualizing) {
      return '지금 적은 과제들을 순차적으로 완벽히 처리하는 자신의 모습을 눈을 감고 시각화해보세요. 어떤 기분이 드나요?';
    }
    switch (cycle.planStep) {
      case 1:
        return '이번 Cycle에서 Flow를 통해 달성할 목표를 한 문장으로 정의해주세요.';
      case 2:
        return '목표 상태를 달성하기 위해 3가지의 작업으로 분할해주세요. 작업은 완결 상태로 정의해주세요.';
      case 3:
        return '실행 가능성을 점검하고, 과제 순서를 드래그해서 조정하세요.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
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

      {/* 현재 단계 가이드 메시지 */}
      <GuideMessage>{getGuideMessage()}</GuideMessage>

      {/* 다음에 할 일 - 목표 정의 단계 */}
      {cycle.planStep === 1 && cycle.backlog.length > 0 && (
        <BacklogSection backlog={cycle.backlog} onChange={setBacklog} />
      )}

      <Card className="relative">
        {isVisualizing && <VisualizationOverlay countdown={countdown} />}
        <CardContent className="p-6 space-y-6">
          {/* 목표 */}
          <GoalSection
            goal={cycle.goal}
            onChange={handleGoalChange}
            onKeyDown={handleGoalKeyDown}
            readonly={cycle.planStep !== 1}
            dimmed={cycle.planStep !== 1}
            autoFocus={cycle.planStep === 1}
          />

          {/* 과제 */}
          <DimmedSection dimmed={cycle.planStep < 2} className="space-y-2">
            <SectionLabel>과제</SectionLabel>
            {cycle.planStep >= 2 ? (
              <BlockEditor
                blocks={cycle.tasks}
                onChange={setTasks}
                placeholder="과제를 작성해보세요."
                maxDepth={1}
                droppableId="tasks"
                showOrder={cycle.planStep === 3}
              />
            ) : (
              <p className="text-xs text-muted-foreground/50">
                목표를 먼저 정의하세요
              </p>
            )}
          </DimmedSection>

          {/* 점검 */}
          <DimmedSection dimmed={cycle.planStep !== 3} className="space-y-2">
            <SectionLabel>점검</SectionLabel>
            {cycle.planStep >= 3 ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <SectionLabel>실행가능성</SectionLabel>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[cycle.probability]}
                      onValueChange={([value]) => setProbability(value)}
                      max={100}
                      step={10}
                      className="flex-1"
                    />
                    <span
                      className={cn(
                        'w-14 text-right font-bold',
                        cycle.probability >= 80
                          ? 'text-green-600'
                          : 'text-orange-500'
                      )}
                    >
                      {cycle.probability}%
                    </span>
                  </div>
                </div>
                {cycle.planStep === 3 && !isStep3Done && (
                  <p className="text-xs text-muted-foreground">
                    빡빡해 보여요. 과제 중 일부를 다음 할 일로 옮겨 실행 가능성을
                    높여보세요.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/50">
                과제를 먼저 분할하세요
              </p>
            )}
          </DimmedSection>
        </CardContent>
      </Card>

      {/* 다음에 할 일 - 목표 점검 단계 */}
      {cycle.planStep === 3 && (
        <BacklogSection
          backlog={cycle.backlog}
          onChange={setBacklog}
          placeholder="과제를 여기로 드래그하세요."
        />
      )}

      {/* 시작 전 체크 - 실행가능성 80% 이상일 때만 표시 */}
      {cycle.planStep === 3 && isStep3Done && (
        <LeverageCheckList
          leverages={beforeLeverages}
          label="시작 전 체크"
          variant="checkbox"
          checkedIds={checkedIds}
          onToggle={toggleCheck}
        />
      )}

      {/* 이전/다음 버튼 */}
      {!isVisualizing && (
        <PhaseNavigation
          onBack={handleBack}
          onNext={cycle.planStep < 3 ? handleNext : startVisualization}
          hideBack={cycle.planStep <= 1}
          hideNext={!canGoNext()}
        />
      )}
    </div>
  );
};
