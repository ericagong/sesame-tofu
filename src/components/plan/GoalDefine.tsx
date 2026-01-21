import { useCycleStore } from '@/stores/cycleStore';
import { generateId } from '@/utils';

export const GoalDefine = () => {
  const { cycle, setGoal, setPlanStep } = useCycleStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoal({
      id: cycle.goal?.id || generateId(),
      content: e.target.value,
      depth: 0,
      status: 'active',
    });
  };

  const handleNext = () => {
    if (cycle.goal?.content) {
      setPlanStep(2);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">목표 정의</h2>
        <p className="text-sm text-muted-foreground">
          이번 90분 동안 달성할 목표를 한 문장으로 작성해주세요.
        </p>
      </div>

      <input
        type="text"
        value={cycle.goal?.content || ''}
        onChange={handleChange}
        placeholder="예: 블로그 포스트 초안 완성하기"
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <button
        onClick={handleNext}
        disabled={!cycle.goal?.content}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  );
};
