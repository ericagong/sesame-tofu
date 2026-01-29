import type { Insight } from '@/entities/insight';
import {
  GuideMessage,
  PhaseNavigation,
  SectionLabel,
  DimmedSection,
  Card,
  GoalSection,
  BacklogSection,
  InspectionSection,
} from '@/shared/primitives';
import { Block } from '@/features/block-editor';
import { InsightSectionedEditor, useInsightsStore } from '@/features/insights';
import { useFlowStore } from '../model/store';
import { areAllMemosClassified } from '../model/selectors';

type ReflectViewProps = {
  onRestRequest: () => void;
};

export const ReflectView = ({ onRestRequest }: ReflectViewProps) => {
  const goal = useFlowStore((s) => s.goal);
  const tasks = useFlowStore((s) => s.tasks);
  const memos = useFlowStore((s) => s.memos);
  const backlog = useFlowStore((s) => s.backlog);
  const insights = useFlowStore((s) => s.insights);
  const probability = useFlowStore((s) => s.probability);
  const setMemos = useFlowStore((s) => s.setMemos);
  const setBacklog = useFlowStore((s) => s.setBacklog);
  const setInsights = useFlowStore((s) => s.setInsights);
  const addInsight = useFlowStore((s) => s.addInsight);
  const removeInsight = useFlowStore((s) => s.removeInsight);
  const toggleInsightStatus = useFlowStore((s) => s.toggleInsightStatus);
  const updateInsightTiming = useFlowStore((s) => s.updateInsightTiming);
  const setPhase = useFlowStore((s) => s.setPhase);
  const { add: addToGlobalInsights } = useInsightsStore();

  const allMemosClassified = areAllMemosClassified(memos);

  const handleAddInsight = (item: Insight) => {
    addInsight(item);
    addToGlobalInsights(item);
  };

  const handleInsightContentChange = (id: string, content: string) => {
    setInsights(
      insights.map((i) =>
        i.id === id ? { ...i, block: { ...i.block, content } } : i
      )
    );
  };

  const handleRest = () => {
    if (allMemosClassified) {
      onRestRequest();
    }
  };

  return (
    <div className="space-y-6">
      {/* 가이드 메시지 */}
      <GuideMessage>작업 중 메모를 Next, Insights로 분류하세요.</GuideMessage>

      {/* 메인 카드 */}
      <Card>
        <Card.Content>
          {/* 목표 */}
          <GoalSection goal={goal} readonly dimmed />

          {/* 과제 */}
          <DimmedSection className="space-y-2">
            <SectionLabel>과제</SectionLabel>
            <Block.Editor
              blocks={tasks}
              onChange={() => {}}
              showOrder
              droppableId="tasks"
              readonly
            />
          </DimmedSection>

          {/* 점검 */}
          <DimmedSection>
            <InspectionSection probability={probability} tasks={tasks} />
          </DimmedSection>

          {/* 작업 중 메모 */}
          <div className="space-y-2">
            <SectionLabel>작업 중 메모</SectionLabel>
            <Block.Editor
              blocks={memos}
              onChange={setMemos}
              placeholder="메모가 없습니다"
              maxDepth={0}
              droppableId="memos"
            />
          </div>
        </Card.Content>
      </Card>

      {/* Next 영역 */}
      <BacklogSection
        backlog={backlog}
        onChange={setBacklog}
        label="Next - 다음에 할 일"
        placeholder="메모를 여기로 드래그하세요"
      />

      {/* Insights 영역 */}
      <Card.Section label="Insights - 다음에 활용할 것">
        <InsightSectionedEditor
          items={insights}
          onAdd={handleAddInsight}
          onContentChange={handleInsightContentChange}
          onTimingChange={updateInsightTiming}
          onToggle={toggleInsightStatus}
          onRemove={removeInsight}
        />
      </Card.Section>

      {/* 이전/다음 버튼 */}
      <PhaseNavigation
        onBack={() => setPhase('execute')}
        onNext={handleRest}
        nextDisabled={!allMemosClassified}
        nextLabel={allMemosClassified ? '다음' : '메모를 모두 분류해주세요'}
      />
    </div>
  );
};
