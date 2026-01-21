import { useState } from 'react';

import { useCycleStore } from '@/stores/cycleStore';
import { useLeverageStore } from '@/stores/leverageStore';
import { useTimerStore } from '@/stores/timerStore';
import { Card, CardContent } from '@/components/ui/card'; // Card still used for main card
import { BlockEditor, LeverageSectionedEditor } from '@/components/editors';
import {
  GoalSection,
  InspectionSection,
  BacklogSection,
} from '@/components/sections';
import { RestDialog } from '@/components/dialogs';
import { GuideMessage, PhaseNavigation, SectionLabel, DimmedSection, SectionCard } from '@/components/common';

import type { LeverageBlock } from '@/types';

export const ReflectPhase = () => {
  const {
    cycle,
    setMemos,
    setBacklog,
    setKeeps,
    setTries,
    addKeep,
    addTry,
    removeKeep,
    removeTry,
    toggleKeepStatus,
    toggleTryStatus,
    updateKeepTiming,
    updateTryTiming,
    resetCycle,
    setPhase,
  } = useCycleStore();
  const { add } = useLeverageStore();
  const {
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useTimerStore();

  const [showRestDialog, setShowRestDialog] = useState(false);

  // 분류되지 않은 메모
  const unclassifiedMemos = cycle.memos.filter((m) => m.status === 'active');
  const allMemosClassified = unclassifiedMemos.length === 0;

  const handleAddKeep = (item: LeverageBlock) => {
    addKeep(item);
    add(item);
  };

  const handleAddTry = (item: LeverageBlock) => {
    addTry(item);
    add(item);
  };

  const handleKeepContentChange = (id: string, content: string) => {
    setKeeps(
      cycle.keeps.map((k) =>
        k.id === id ? { ...k, block: { ...k.block, content } } : k
      )
    );
  };

  const handleTryContentChange = (id: string, content: string) => {
    setTries(
      cycle.tries.map((t) =>
        t.id === id ? { ...t, block: { ...t.block, content } } : t
      )
    );
  };

  const handleRest = () => {
    if (allMemosClassified) {
      setShowRestDialog(true);
    }
  };

  const handleRestStart = () => {
    pauseTimer();
  };

  const handleRestCancel = () => {
    startTimer();
  };

  const handleNewCycle = () => {
    resetTimer();
    resetCycle();
    setShowRestDialog(false);
  };

  const handleEndDay = () => {
    resetTimer();
    setShowRestDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* 가이드 메시지 */}
      <GuideMessage>작업 중 메모를 Next, Keep, Try로 분류하세요.</GuideMessage>

      {/* 메인 카드 */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* 목표 */}
          <GoalSection goal={cycle.goal} readonly dimmed />

          {/* 과제 */}
          <DimmedSection className="space-y-2">
            <SectionLabel>과제</SectionLabel>
            <BlockEditor
              blocks={cycle.tasks}
              onChange={() => {}}
              showOrder
              droppableId="tasks"
              readonly
            />
          </DimmedSection>

          {/* 점검 */}
          <DimmedSection>
            <InspectionSection
              probability={cycle.probability}
              tasks={cycle.tasks}
            />
          </DimmedSection>

          {/* 작업 중 메모 */}
          <div className="space-y-2">
            <SectionLabel>작업 중 메모</SectionLabel>
            <BlockEditor
              blocks={cycle.memos}
              onChange={setMemos}
              placeholder="메모가 없습니다"
              maxDepth={0}
              droppableId="memos"
            />
          </div>
        </CardContent>
      </Card>

      {/* Next 영역 */}
      <BacklogSection
        backlog={cycle.backlog}
        onChange={setBacklog}
        label="Next - 다음에 할 일"
        placeholder="메모를 여기로 드래그하세요"
      />

      {/* Keep 영역 */}
      <SectionCard label="Keep - 효과 있었던 것">
        <LeverageSectionedEditor
          items={cycle.keeps}
          onAdd={handleAddKeep}
          onContentChange={handleKeepContentChange}
          onTimingChange={updateKeepTiming}
          onToggle={toggleKeepStatus}
          onRemove={removeKeep}
          source="keep"
          droppableIdPrefix="keeps"
        />
      </SectionCard>

      {/* Try 영역 */}
      <SectionCard label="Try - 다음에 시도할 것">
        <LeverageSectionedEditor
          items={cycle.tries}
          onAdd={handleAddTry}
          onContentChange={handleTryContentChange}
          onTimingChange={updateTryTiming}
          onToggle={toggleTryStatus}
          onRemove={removeTry}
          source="try"
          droppableIdPrefix="tries"
        />
      </SectionCard>

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
        onNewCycle={handleNewCycle}
        onEndDay={handleEndDay}
        onRestStart={handleRestStart}
        onRestCancel={handleRestCancel}
      />
    </div>
  );
};
