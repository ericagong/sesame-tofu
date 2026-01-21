import { useCycleStore } from '@/stores/cycleStore';
import { useLeverageStore } from '@/stores/leverageStore';
import { BlockEditor } from '@/components/editors';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  GoalSection,
  InspectionSection,
  LeverageCheckList,
  MemoSection,
} from '@/components/sections';
import { GuideMessage, PhaseNavigation, SectionLabel, DimmedSection } from '@/components/common';

export const ExecutePhase = () => {
  const { cycle, setTasks, setMemos, setPhase } = useCycleStore();
  const { getByTiming } = useLeverageStore();

  const duringLeverages = getByTiming('during');

  // depth 0 완료 카운트 (배지용)
  const completedDepth0Count = cycle.tasks.filter(
    (t) => t.depth === 0 && t.status === 'deleted'
  ).length;
  const totalDepth0Count = cycle.tasks.filter((t) => t.depth === 0).length;

  const handleReflect = () => {
    setPhase('reflect');
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <GuideMessage>과제를 완료하면 체크하세요.</GuideMessage>
        <Badge variant="secondary">
          {completedDepth0Count} / {totalDepth0Count} 완료
        </Badge>
      </div>

      {/* 메인 카드 */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* 목표 */}
          <GoalSection goal={cycle.goal} readonly dimmed />

          {/* 과제 */}
          <div className="space-y-2">
            <SectionLabel>과제</SectionLabel>
            <BlockEditor
              blocks={cycle.tasks}
              onChange={setTasks}
              showOrder
              droppableId="tasks"
            />
          </div>

          {/* 점검 */}
          <DimmedSection>
            <InspectionSection
              probability={cycle.probability}
              tasks={cycle.tasks}
            />
          </DimmedSection>
        </CardContent>
      </Card>

      {/* 작업 중 Leverage */}
      <LeverageCheckList
        leverages={duringLeverages}
        label="작업 중 기억하세요"
        variant="badge"
      />

      {/* 작업 중 메모 */}
      <MemoSection memos={cycle.memos} onChange={setMemos} />

      {/* 이전/다음 버튼 */}
      <PhaseNavigation
        onBack={() => setPhase('plan')}
        onNext={handleReflect}
      />
    </div>
  );
};
