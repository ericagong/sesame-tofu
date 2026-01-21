import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

import { useCycleStore } from '@/stores/cycleStore';
import { useLeverageStore } from '@/stores/leverageStore';
import { useTimerStore } from '@/stores/timerStore';
import { BlockEditor } from '@/components/BlockEditor';

export const GoalVisualize = () => {
  const { cycle, setTasks, setPhase, setPlanStep } = useCycleStore();
  const { getByTiming } = useLeverageStore();
  const { start } = useTimerStore();

  const [isVisualizing, setIsVisualizing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isReady, setIsReady] = useState(false);

  const beforeLeverages = getByTiming('before');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const allChecked =
    beforeLeverages.length === 0 ||
    beforeLeverages.every((l) => checkedIds.has(l.id));

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
    if (allChecked) {
      setIsVisualizing(true);
    }
  };

  useEffect(() => {
    if (!isVisualizing) return;

    if (countdown <= 0) {
      setIsReady(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isVisualizing, countdown]);

  const handleStart = () => {
    setPhase('execute');
    start();
  };

  const handleBack = () => {
    setPlanStep(3);
  };

  if (isReady) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-8 h-8 text-primary-foreground" />
        </div>
        <p className="text-xl font-medium">{cycle.goal?.content}</p>
        <p className="text-muted-foreground">준비됐어요!</p>
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg text-lg font-medium"
        >
          시작 ▶
        </button>
      </div>
    );
  }

  if (isVisualizing) {
    // 상위 블록 순서 번호 계산
    let orderNum = 0;
    const getOrder = (block: typeof cycle.tasks[0]) => {
      if (block.depth === 0) {
        orderNum++;
        return orderNum;
      }
      return null;
    };

    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
          <span className="text-2xl font-bold">{countdown}</span>
        </div>
        <p className="text-xl font-medium">{cycle.goal?.content}</p>
        <div className="space-y-1 text-left">
          {cycle.tasks
            .filter((t) => t.status === 'active')
            .map((task) => {
              const order = getOrder(task);
              return (
                <p
                  key={task.id}
                  className={`text-muted-foreground ${task.depth === 1 ? 'ml-6' : ''}`}
                >
                  {order ? `${order}. ` : '• '}
                  {task.content}
                </p>
              );
            })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">목표 시각화</h2>
        <p className="text-sm text-muted-foreground">
          과제 순서를 정해주세요. 드래그해서 바꿀 수 있어요!
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <BlockEditor
          blocks={cycle.tasks}
          onChange={setTasks}
          showOrder
          maxDepth={1}
          droppableId="tasks"
        />
      </div>

      {beforeLeverages.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">시작 전에 이것만 체크해요 ✓</p>
          {beforeLeverages.map((leverage) => (
            <label key={leverage.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedIds.has(leverage.id)}
                onChange={() => toggleCheck(leverage.id)}
                className="w-4 h-4"
              />
              <span className="text-sm">{leverage.block.content}</span>
            </label>
          ))}
          <p className="text-xs text-muted-foreground">
            다 체크하면 시각화가 시작돼요
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleBack}
          className="px-6 py-2 border rounded-lg hover:bg-accent"
        >
          이전
        </button>
        <button
          onClick={startVisualization}
          disabled={!allChecked}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          시각화 시작
        </button>
      </div>
    </div>
  );
};
