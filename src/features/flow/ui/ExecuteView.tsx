import { Badge } from '@/shared/core/badge';
import {
  Card,
  GuideMessage,
  PhaseNavigation,
  SectionLabel,
  DimmedSection,
  GoalSection,
  InspectionSection,
  InsightCheckList,
} from '@/shared/primitives';
import { Block } from '@/features/block-editor';
import { useFlowStore } from '../model/store';
import { useInsightsStore } from '@/features/insights';
import { MemoSection } from './MemoSection';
import { getCompletedTaskCount, getTotalTaskCount } from '../model/selectors';

export const ExecuteView = () => {
  const goal = useFlowStore((s) => s.goal);
  const tasks = useFlowStore((s) => s.tasks);
  const memos = useFlowStore((s) => s.memos);
  const probability = useFlowStore((s) => s.probability);
  const setTasks = useFlowStore((s) => s.setTasks);
  const setMemos = useFlowStore((s) => s.setMemos);
  const setPhase = useFlowStore((s) => s.setPhase);
  const { getByTiming } = useInsightsStore();

  const duringInsights = getByTiming('during');

  // depth 0 완료 카운트 (배지용)
  const completedCount = getCompletedTaskCount(tasks);
  const totalCount = getTotalTaskCount(tasks);

  const handleReflect = () => {
    setPhase('reflect');
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <GuideMessage>과제를 완료하면 체크하세요.</GuideMessage>
        <Badge variant="secondary">
          {completedCount} / {totalCount} 완료
        </Badge>
      </div>

      {/* 메인 카드 */}
      <Card>
        <Card.Content>
          {/* 목표 */}
          <GoalSection goal={goal} readonly dimmed />

          {/* 과제 */}
          <div className="space-y-2">
            <SectionLabel>과제</SectionLabel>
            <Block.Editor
              blocks={tasks}
              onChange={setTasks}
              showOrder
              droppableId="tasks"
            />
          </div>

          {/* 점검 */}
          <DimmedSection>
            <InspectionSection probability={probability} tasks={tasks} />
          </DimmedSection>
        </Card.Content>
      </Card>

      {/* 작업 중 Insight */}
      <InsightCheckList
        insights={duringInsights}
        label="작업 중 기억하세요"
        variant="badge"
      />

      {/* 작업 중 메모 */}
      <MemoSection memos={memos} onChange={setMemos} />

      {/* 이전/다음 버튼 */}
      <PhaseNavigation
        onBack={() => setPhase('plan')}
        onNext={handleReflect}
      />
    </div>
  );
};
