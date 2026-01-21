import { useRef, useState } from 'react';

import { useCycleStore } from '@/stores/cycleStore';
import { BlockEditor } from '@/components/BlockEditor';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export const GoalCheck = () => {
  const { cycle, setTasks, setProbability, setPlanStep } = useCycleStore();
  const [hasMovedToBacklog, setHasMovedToBacklog] = useState(false);
  const prevTaskCountRef = useRef(cycle.tasks.length);

  const canProceed = cycle.probability >= 80;

  // tasks 변경 감지하여 backlog로 이동했는지 확인
  const handleTasksChange = (newTasks: typeof cycle.tasks) => {
    if (newTasks.length < prevTaskCountRef.current) {
      setHasMovedToBacklog(true);
    }
    prevTaskCountRef.current = newTasks.length;
    setTasks(newTasks);
  };

  const handleNext = () => {
    if (canProceed) {
      setPlanStep(4);
    }
  };

  const handleBack = () => {
    setPlanStep(2);
  };

  const getMessage = () => {
    if (cycle.probability < 80) {
      return '아직 좀 빡빡해 보여요 😅\n과제 몇 개를 다음에 할 일로 빼볼까요?';
    }
    return '좋아요! 이 정도면 충분히 할 수 있겠네요 💪';
  };

  // 80% 미만일 때는 backlog로 이동해야만 다음 진행 가능
  const canGoNext = canProceed || (cycle.probability < 80 && hasMovedToBacklog);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">목표 점검</h2>
        {cycle.goal && (
          <p className="text-sm font-medium text-primary">
            목표: {cycle.goal.content}
          </p>
        )}
      </div>

      {/* 과제 목록 */}
      <div className="border rounded-lg p-4 min-h-[150px]">
        <p className="text-sm text-muted-foreground mb-3">
          과제를 다음에 할 일로 드래그해서 옮길 수 있어요
        </p>
        <BlockEditor
          blocks={cycle.tasks}
          onChange={handleTasksChange}
          maxDepth={1}
          droppableId="tasks"
        />
      </div>

      {/* 확률 슬라이더 */}
      <div className="space-y-4 p-4 border rounded-lg">
        <p className="text-sm font-medium">
          이 정도면 60분 안에 할 수 있겠어요?
        </p>

        <div className="flex items-center gap-4">
          <Slider
            value={[cycle.probability]}
            onValueChange={([value]) => {
              setProbability(value);
              setHasMovedToBacklog(false);
            }}
            max={100}
            step={1}
            className="flex-1"
          />
          <span
            className={cn(
              'w-14 text-right font-bold text-lg',
              cycle.probability >= 80 ? 'text-green-600' : 'text-orange-500'
            )}
          >
            {cycle.probability}%
          </span>
        </div>

        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {getMessage()}
        </p>

        {cycle.probability < 80 && !hasMovedToBacklog && (
          <p className="text-sm text-orange-500">
            80% 미만이면 과제를 다음에 할 일로 옮겨야 진행할 수 있어요
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleBack}
          className="px-6 py-2 border rounded-lg hover:bg-accent"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  );
};
