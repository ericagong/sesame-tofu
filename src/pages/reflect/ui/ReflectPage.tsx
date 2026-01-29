import { useState } from 'react';

import { usePomodoroStore, type Insight } from '@/entities/pomodoro';
import { useLeverageStore } from '@/entities/leverage';
import { useTimerStore } from '@/entities/timer';
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
import { InsightSectionedEditor } from '@/features/insight-editor';
import { RestDialog } from '@/widgets/rest-dialog';

export const ReflectPhase = () => {
  const {
    pomodoro,
    setMemos,
    setBacklog,
    setInsights,
    addInsight,
    removeInsight,
    toggleInsightStatus,
    updateInsightTiming,
    resetPomodoro,
    setPhase,
  } = usePomodoroStore();
  const { add } = useLeverageStore();
  const { startFlow, pauseFlow, resetFlow } = useTimerStore();

  const [showRestDialog, setShowRestDialog] = useState(false);

  // 분류되지 않은 메모
  const unclassifiedMemos = pomodoro.memos.filter((m) => m.status === 'active');
  const allMemosClassified = unclassifiedMemos.length === 0;

  const handleAddInsight = (item: Insight) => {
    addInsight(item);
    add(item);
  };

  const handleInsightContentChange = (id: string, content: string) => {
    setInsights(
      pomodoro.insights.map((i) =>
        i.id === id ? { ...i, block: { ...i.block, content } } : i
      )
    );
  };

  const handleRest = () => {
    if (allMemosClassified) {
      setShowRestDialog(true);
    }
  };

  const handleRestStart = () => {
    pauseFlow();
  };

  const handleRestCancel = () => {
    startFlow();
  };

  const handleNewPomodoro = () => {
    resetFlow();
    resetPomodoro();
    setShowRestDialog(false);
  };

  const handleEndDay = () => {
    resetFlow();
    setShowRestDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* 가이드 메시지 */}
      <GuideMessage>작업 중 메모를 Next, Insights로 분류하세요.</GuideMessage>

      {/* 메인 카드 */}
      <Card>
        <Card.Content>
          {/* 목표 */}
          <GoalSection goal={pomodoro.goal} readonly dimmed />

          {/* 과제 */}
          <DimmedSection className="space-y-2">
            <SectionLabel>과제</SectionLabel>
            <Block.Editor
              blocks={pomodoro.tasks}
              onChange={() => {}}
              showOrder
              droppableId="tasks"
              readonly
            />
          </DimmedSection>

          {/* 점검 */}
          <DimmedSection>
            <InspectionSection
              probability={pomodoro.probability}
              tasks={pomodoro.tasks}
            />
          </DimmedSection>

          {/* 작업 중 메모 */}
          <div className="space-y-2">
            <SectionLabel>작업 중 메모</SectionLabel>
            <Block.Editor
              blocks={pomodoro.memos}
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
        backlog={pomodoro.backlog}
        onChange={setBacklog}
        label="Next - 다음에 할 일"
        placeholder="메모를 여기로 드래그하세요"
      />

      {/* Insights 영역 */}
      <Card.Section label="Insights - 다음에 활용할 것">
        <InsightSectionedEditor
          items={pomodoro.insights}
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

      {/* 휴식 다이얼로그 */}
      <RestDialog
        open={showRestDialog}
        onOpenChange={setShowRestDialog}
        onNewPomodoro={handleNewPomodoro}
        onEndDay={handleEndDay}
        onRestStart={handleRestStart}
        onRestCancel={handleRestCancel}
      />
    </div>
  );
};
