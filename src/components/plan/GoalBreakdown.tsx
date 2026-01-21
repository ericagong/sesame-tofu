import { useCycleStore } from '@/stores/cycleStore';
import { BlockEditor } from '@/components/BlockEditor';

export const GoalBreakdown = () => {
  const { cycle, setTasks, setPlanStep } = useCycleStore();

  const handleNext = () => {
    if (cycle.tasks.length > 0) {
      setPlanStep(3);
    }
  };

  const handleBack = () => {
    setPlanStep(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">목표 분할</h2>
        <p className="text-sm text-muted-foreground">
          목표를 달성하기 위한 과제들을 작성해주세요. (3개 × 3할일 권장)
        </p>
        {cycle.goal && (
          <p className="mt-2 text-sm font-medium text-primary">
            목표: {cycle.goal.content}
          </p>
        )}
      </div>

      <div className="border rounded-lg p-4 min-h-[200px]">
        <BlockEditor
          blocks={cycle.tasks}
          onChange={setTasks}
          placeholder="과제를 추가하세요..."
          maxDepth={1}
          droppableId="tasks"
        />
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
          disabled={cycle.tasks.length === 0}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  );
};
