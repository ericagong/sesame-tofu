import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';

import { useCycleStore } from '@/stores/cycleStore';
import { useLeverageStore } from '@/stores/leverageStore';
import { useTimerStore } from '@/stores/timerStore';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BlockEditor } from '@/components/BlockEditor';
import { LeverageSectionedEditor } from '@/components/LeverageSectionedEditor';

import type { Block, LeverageBlock } from '@/types';

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
  const { start: startTimer, pause: pauseTimer, reset: resetTimer } = useTimerStore();

  const [showRestDialog, setShowRestDialog] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restDuration, setRestDuration] = useState<10 | 20 | null>(null);

  // 완료율 계산 (depth 0 + depth 1)
  const allCompletedCount = cycle.tasks.filter((t) => t.status === 'deleted').length;
  const allTotalCount = cycle.tasks.length;
  const completionRate = allTotalCount > 0 ? (allCompletedCount / allTotalCount) * 100 : 0;

  // 분류되지 않은 메모
  const unclassifiedMemos = cycle.memos.filter((m) => m.status === 'active');
  const allMemosClassified = unclassifiedMemos.length === 0;

  // 휴식 타이머
  useEffect(() => {
    if (!isResting || restSeconds <= 0) return;

    const timer = setInterval(() => {
      setRestSeconds((s) => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isResting, restSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isRestComplete = isResting && restSeconds <= 0;

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
      setIsResting(false);
      setRestSeconds(0);
      setRestDuration(null);
    }
  };

  const handleRestStart = (duration: 10 | 20) => {
    pauseTimer(); // Flow 타이머 정지
    setRestDuration(duration);
    setRestSeconds(duration * 60);
    setIsResting(true);
  };

  const handleNewCycle = () => {
    resetTimer(); // Flow 타이머 리셋 (90분으로)
    resetCycle();
    setShowRestDialog(false);
    setIsResting(false);
  };

  const handleEndDay = () => {
    resetTimer(); // Flow 타이머 리셋
    setShowRestDialog(false);
    setIsResting(false);
  };

  return (
    <div className="space-y-6">
      {/* 가이드 메시지 */}
      <p className="text-xs text-muted-foreground">
        작업 중 메모를 Next, Keep, Try로 분류하세요.
      </p>

      {/* 메인 카드 */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* 목표 */}
          <div className="space-y-2 opacity-50">
            <span className="text-xs text-muted-foreground">목표</span>
            <p className="text-xs">{cycle.goal?.content}</p>
          </div>

          {/* 과제 */}
          <div className="space-y-2 opacity-50">
            <span className="text-xs text-muted-foreground">과제</span>
            <BlockEditor
              blocks={cycle.tasks}
              onChange={() => {}}
              showOrder
              droppableId="tasks"
              readonly
            />
          </div>

          {/* 점검 */}
          <div className="space-y-3 opacity-50">
            <span className="text-xs text-muted-foreground">점검</span>

            {/* 실행가능성 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">실행가능성</span>
                <span className="text-xs font-bold text-muted-foreground">
                  {cycle.probability}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${cycle.probability}%` }}
                />
              </div>
            </div>

            {/* 실제수행률 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">실제수행률</span>
                <span className="text-xs font-bold text-foreground">
                  {Math.round(completionRate)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* 작업 중 메모 */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">작업 중 메모</span>
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
      <NextSection
        backlog={cycle.backlog}
        onChange={setBacklog}
      />

      {/* Keep 영역 */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 space-y-2">
          <span className="text-xs text-muted-foreground">Keep - 효과 있었던 것</span>
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
        </CardContent>
      </Card>

      {/* Try 영역 */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 space-y-2">
          <span className="text-xs text-muted-foreground">Try - 다음에 시도할 것</span>
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
        </CardContent>
      </Card>

      {/* 이전/다음 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={() => setPhase('execute')}
          className="text-sm hover:underline"
        >
          이전
        </button>
        <button
          onClick={handleRest}
          disabled={!allMemosClassified}
          className="text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          {allMemosClassified ? '다음' : '메모를 모두 분류해주세요'}
        </button>
      </div>

      {/* 휴식 다이얼로그 */}
      <Dialog open={showRestDialog} onOpenChange={(open) => {
        if (!open && isResting && restSeconds > 0) {
          // 휴식 중 모달이 닫히면 Flow 타이머 재개
          startTimer();
        }
        setShowRestDialog(open);
        if (!open) setIsResting(false);
      }}>
        <DialogContent className="sm:max-w-lg">
          {!isResting ? (
            <>
              <DialogHeader className="text-center">
                <DialogTitle className="text-xl">잠깐 쉬어가요 ☕</DialogTitle>
                <DialogDescription className="text-center space-y-2">
                  <span className="block text-2xl pt-2">고생했어요! 🎉</span>
                  <span className="block">
                    효율적 작업을 위해 반드시 10분은 쉬어가야 해요.
                    <br />
                    스트레칭을 한다면 추가 10분을 더 쉴 수 있어요!
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-4 justify-center py-4">
                <button
                  onClick={() => handleRestStart(10)}
                  className="px-6 py-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">10분</div>
                </button>
                <button
                  onClick={() => handleRestStart(20)}
                  className="px-6 py-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">20분</div>
                  <div className="text-xs text-muted-foreground">+ 스트레칭</div>
                </button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="text-center">
                <DialogTitle className="text-xl">
                  {isRestComplete ? '휴식 완료!' : '휴식 중...'}
                </DialogTitle>
              </DialogHeader>

              {/* 타이머 */}
              <div className="text-center py-4">
                <div className={`text-5xl font-bold ${isRestComplete ? 'text-green-500' : ''}`}>
                  {formatTime(restSeconds)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {restDuration}분 휴식 {isRestComplete ? '완료' : '중'}
                </p>
              </div>

              {/* YouTube 영상 */}
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  src={restDuration === 20
                    ? "https://www.youtube.com/embed/7jTO4GqHbog?autoplay=1"
                    : "https://www.youtube.com/embed/AT7hIY1vNy0?autoplay=1"
                  }
                  title="휴식 영상"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* 완료 후 버튼 */}
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleNewCycle}
                  disabled={!isRestComplete}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 사이클
                </button>
                <button
                  onClick={handleEndDay}
                  disabled={!isRestComplete}
                  className="px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                >
                  오늘 마감
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Next 섹션 컴포넌트
type NextSectionProps = {
  backlog: Block[];
  onChange: (blocks: Block[]) => void;
};

const NextSection = ({ backlog, onChange }: NextSectionProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'backlog',
  });

  return (
    <Card className={`bg-muted/50 transition-colors ${isOver ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4 space-y-2">
        <span className="text-xs text-muted-foreground">Next - 다음에 할 일</span>
        <div ref={setNodeRef} className="min-h-[40px]">
          <BlockEditor
            blocks={backlog}
            onChange={onChange}
            placeholder="메모를 여기로 드래그하세요"
            maxDepth={0}
            droppableId="backlog"
          />
        </div>
      </CardContent>
    </Card>
  );
};
