import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

import { useCycleStore } from '@/stores/cycleStore';
import { useLeverageStore } from '@/stores/leverageStore';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BlockEditor } from '@/components/BlockEditor';
import { generateId } from '@/utils';

import type { LeverageBlock } from '@/types';

export const ReflectPhase = () => {
  const {
    cycle,
    setMemos,
    setKeeps,
    setTries,
    addKeep,
    addTry,
    updateKeepTiming,
    updateTryTiming,
    resetCycle,
  } = useCycleStore();
  const { add } = useLeverageStore();

  const [showRestDialog, setShowRestDialog] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restDuration, setRestDuration] = useState<10 | 20 | null>(null);

  // 완료율 계산
  const totalTasks = cycle.tasks.filter((t) => t.depth === 0).length;
  const completedTasks = cycle.tasks.filter(
    (t) => t.depth === 0 && t.status === 'deleted'
  ).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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

  const handleAddKeep = () => {
    const newLeverageBlock: LeverageBlock = {
      id: generateId(),
      block: {
        id: generateId(),
        content: '',
        depth: 0,
        status: 'active',
      },
      timing: 'before',
      source: 'keep',
      status: 'active',
      createdAt: new Date(),
    };
    addKeep(newLeverageBlock);
    add(newLeverageBlock);
  };

  const handleAddTry = () => {
    const newLeverageBlock: LeverageBlock = {
      id: generateId(),
      block: {
        id: generateId(),
        content: '',
        depth: 0,
        status: 'active',
      },
      timing: 'before',
      source: 'try',
      status: 'active',
      createdAt: new Date(),
    };
    addTry(newLeverageBlock);
    add(newLeverageBlock);
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
    setRestDuration(duration);
    setRestSeconds(duration * 60);
    setIsResting(true);
  };

  const handleNewCycle = () => {
    resetCycle();
    setShowRestDialog(false);
    setIsResting(false);
  };

  const handleEndDay = () => {
    setShowRestDialog(false);
    setIsResting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">회고</h2>
        <p className="text-sm text-muted-foreground">
          {cycle.goal?.content}
        </p>
      </div>

      {/* 완료율 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>완료율</span>
          <span>{Math.round(completionRate)}%</span>
        </div>
        <Progress value={completionRate} className="h-2" />
      </div>

      {/* 분류할 메모 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">📝 분류할 메모</h3>
        <p className="text-xs text-muted-foreground">
          메모를 Keep이나 Try로 드래그해서 분류하세요
        </p>
        <div className="border rounded-lg p-4 min-h-[60px]">
          <BlockEditor
            blocks={cycle.memos}
            onChange={setMemos}
            placeholder="메모 추가..."
            maxDepth={0}
            droppableId="memos"
          />
        </div>
      </div>

      {/* Keep 영역 */}
      <KeepTrySection
        title="😊 Keep - 오늘 효과 있었던 것들"
        droppableId="keeps"
        items={cycle.keeps}
        onAdd={handleAddKeep}
        onContentChange={handleKeepContentChange}
        onTimingChange={updateKeepTiming}
      />

      {/* Try 영역 */}
      <KeepTrySection
        title="🔄 Try - 다음에 시도해볼 것들"
        droppableId="tries"
        items={cycle.tries}
        onAdd={handleAddTry}
        onContentChange={handleTryContentChange}
        onTimingChange={updateTryTiming}
      />

      <button
        onClick={handleRest}
        disabled={!allMemosClassified}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {allMemosClassified ? '휴식하기' : '메모를 모두 분류해주세요'}
      </button>

      {/* 휴식 다이얼로그 */}
      <Dialog open={showRestDialog} onOpenChange={(open) => {
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
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
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

// Keep/Try 섹션 컴포넌트
type KeepTrySectionProps = {
  title: string;
  droppableId: 'keeps' | 'tries';
  items: LeverageBlock[];
  onAdd: () => void;
  onContentChange: (id: string, content: string) => void;
  onTimingChange: (id: string, timing: 'before' | 'during' | 'after') => void;
};

const KeepTrySection = ({
  title,
  droppableId,
  items,
  onAdd,
  onContentChange,
  onTimingChange,
}: KeepTrySectionProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <button
          onClick={onAdd}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={`border rounded-lg p-4 min-h-[80px] space-y-2 transition-colors ${
          isOver ? 'bg-accent/50 border-primary' : ''
        }`}
      >
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            메모를 여기로 드래그하거나 + 버튼으로 추가하세요
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="text"
                value={item.block.content}
                onChange={(e) => onContentChange(item.id, e.target.value)}
                placeholder="내용을 입력하세요"
                className="flex-1 bg-transparent outline-none text-sm border-b border-transparent focus:border-primary"
              />
              <Select
                value={item.timing}
                onValueChange={(v) =>
                  onTimingChange(item.id, v as 'before' | 'during' | 'after')
                }
              >
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">시작 전</SelectItem>
                  <SelectItem value="during">작업 중</SelectItem>
                  <SelectItem value="after">회고 시</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
