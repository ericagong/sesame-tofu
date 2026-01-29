import { useState, useEffect } from 'react';
import { usePomodoroStore } from '@/entities/pomodoro';
import { useLeverageStore } from '@/entities/leverage';
import { Slider } from '@/shared/core/slider';
import {
  GuideMessage,
  PhaseNavigation,
  SectionLabel,
  DimmedSection,
  Card,
  Tabs,
  GoalSection,
  BacklogSection,
  InsightCheckList,
} from '@/shared/primitives';
import { Block } from '@/features/block-editor';
import VisualizationOverlay from './VisualizationOverlay';
import { cn, generateId } from '@/shared/lib/utils';

type PlanStep = 1 | 2 | 3;

const tabs: { step: PlanStep; label: string }[] = [
  { step: 1, label: '목표 정의' },
  { step: 2, label: '목표 분할' },
  { step: 3, label: '목표 점검' },
];

const guideMessages: Record<PlanStep | 'visualizing', string> = {
  1: '이번 Flow를 통해 달성할 목표를 한 문장으로 정의해주세요.',
  2: '목표 상태를 달성하기 위해 3가지의 작업으로 분할해주세요. 작업은 완결 상태로 정의해주세요.',
  3: '실행 가능성을 점검하고, 과제 순서를 드래그해서 조정하세요.',
  visualizing: '지금 적은 과제들을 순차적으로 완벽히 처리하는 자신의 모습을 눈을 감고 시각화해보세요. 어떤 기분이 드나요?',
};

export const PlanPhase = () => {
  const goal = usePomodoroStore((s) => s.goal);
  const tasks = usePomodoroStore((s) => s.tasks);
  const backlog = usePomodoroStore((s) => s.backlog);
  const probability = usePomodoroStore((s) => s.probability);
  const setGoal = usePomodoroStore((s) => s.setGoal);
  const setTasks = usePomodoroStore((s) => s.setTasks);
  const setBacklog = usePomodoroStore((s) => s.setBacklog);
  const setProbability = usePomodoroStore((s) => s.setProbability);
  const setPhase = usePomodoroStore((s) => s.setPhase);
  const { getByTiming } = useLeverageStore();

  // planStep을 로컬 상태로 관리
  const [planStep, setPlanStep] = useState<PlanStep>(1);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const beforeInsights = getByTiming('before');

  const allChecked =
    beforeInsights.length === 0 ||
    beforeInsights.every((i) => checkedIds.has(i.id));

  // 각 단계 완료 여부
  const isStep1Done = !!goal?.content;
  const isStep2Done = tasks.length > 0;
  const isStep3Done = probability >= 80;

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
    if (planStep < 3) {
      setPlanStep((planStep + 1) as PlanStep);
    }
  };

  const handleBack = () => {
    if (planStep > 1) {
      setPlanStep((planStep - 1) as PlanStep);
    }
  };

  const canGoNext = () => {
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
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
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

      {/* 현재 단계 가이드 메시지 */}
      <GuideMessage>
        {isVisualizing
          ? guideMessages.visualizing
          : guideMessages[planStep]}
      </GuideMessage>

      {/* Step 1: 목표 정의 */}
      {planStep === 1 && (
        <>
          {backlog.length > 0 && (
            <BacklogSection backlog={backlog} onChange={setBacklog} />
          )}

          <Card>
            <Card.Content>
              <GoalSection
                goal={goal}
                onChange={handleGoalChange}
                onKeyDown={handleGoalKeyDown}
                autoFocus
              />

              <DimmedSection dimmed className="space-y-2">
                <SectionLabel>과제</SectionLabel>
                <p className="text-xs text-muted-foreground/50">
                  목표를 먼저 정의하세요
                </p>
              </DimmedSection>

              <DimmedSection dimmed className="space-y-2">
                <SectionLabel>점검</SectionLabel>
                <p className="text-xs text-muted-foreground/50">
                  과제를 먼저 분할하세요
                </p>
              </DimmedSection>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Step 2: 목표 분할 */}
      {planStep === 2 && (
        <Card>
          <Card.Content>
            <GoalSection goal={goal} readonly dimmed />

            <div className="space-y-2">
              <SectionLabel>과제</SectionLabel>
              <Block.Editor
                blocks={tasks}
                onChange={setTasks}
                placeholder="과제를 작성해보세요."
                maxDepth={1}
                droppableId="tasks"
              />
            </div>

            <DimmedSection dimmed className="space-y-2">
              <SectionLabel>점검</SectionLabel>
              <p className="text-xs text-muted-foreground/50">
                과제를 먼저 분할하세요
              </p>
            </DimmedSection>
          </Card.Content>
        </Card>
      )}

      {/* Step 3: 목표 점검 */}
      {planStep === 3 && (
        <>
          <Card className="relative">
            {isVisualizing && <VisualizationOverlay countdown={countdown} />}
            <Card.Content>
              <GoalSection goal={goal} readonly dimmed />

              <DimmedSection dimmed={false} className="space-y-2">
                <SectionLabel>과제</SectionLabel>
                <Block.Editor
                  blocks={tasks}
                  onChange={setTasks}
                  placeholder="과제를 작성해보세요."
                  maxDepth={1}
                  droppableId="tasks"
                  showOrder
                />
              </DimmedSection>

              <div className="space-y-2">
                <SectionLabel>점검</SectionLabel>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <SectionLabel>실행가능성</SectionLabel>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[probability]}
                        onValueChange={([value]) => setProbability(value)}
                        max={100}
                        step={10}
                        className="flex-1"
                      />
                      <span
                        className={cn(
                          'w-14 text-right font-bold',
                          probability >= 80 ? 'text-green-600' : 'text-orange-500'
                        )}
                      >
                        {probability}%
                      </span>
                    </div>
                  </div>
                  {!isStep3Done && (
                    <p className="text-xs text-muted-foreground">
                      빡빡해 보여요. 과제 중 일부를 다음 할 일로 옮겨 실행 가능성을
                      높여보세요.
                    </p>
                  )}
                </div>
              </div>
            </Card.Content>
          </Card>

          <BacklogSection
            backlog={backlog}
            onChange={setBacklog}
            placeholder="과제를 여기로 드래그하세요."
          />

          {isStep3Done && (
            <InsightCheckList
              insights={beforeInsights}
              label="시작 전 체크"
              variant="checkbox"
              checkedIds={checkedIds}
              onToggle={toggleCheck}
            />
          )}
        </>
      )}

      {/* 이전/다음 버튼 */}
      {!isVisualizing && (
        <PhaseNavigation
          onBack={handleBack}
          onNext={planStep < 3 ? handleNext : startVisualization}
          hideBack={planStep <= 1}
          hideNext={!canGoNext()}
        />
      )}
    </div>
  );
};
