import { useCycleStore } from '@/stores/cycleStore';
import { useLeverageStore } from '@/stores/leverageStore';
import { BlockEditor } from '@/components/BlockEditor';
import { Badge } from '@/components/ui/badge';

export const ExecutePhase = () => {
  const { cycle, setTasks, setPhase } = useCycleStore();
  const { getByTiming } = useLeverageStore();

  const duringLeverages = getByTiming('during');

  const completedCount = cycle.tasks.filter(
    (t) => t.depth === 0 && t.status === 'deleted'
  ).length;
  const totalCount = cycle.tasks.filter((t) => t.depth === 0).length;

  const handleReflect = () => {
    setPhase('reflect');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">실행</h2>
          <p className="text-sm text-muted-foreground">
            {cycle.goal?.content}
          </p>
        </div>
        <Badge variant="secondary">
          {completedCount} / {totalCount} 완료
        </Badge>
      </div>

      {/* 과제 체크리스트 */}
      <div className="border rounded-lg p-4 min-h-[200px]">
        <BlockEditor
          blocks={cycle.tasks}
          onChange={setTasks}
          showOrder
          droppableId="tasks"
        />
      </div>

      {/* 작업 중 Leverage */}
      {duringLeverages.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <p className="text-sm font-medium mb-3">작업 중 기억하세요 ✨</p>
          <div className="space-y-2">
            {duringLeverages.map((leverage) => (
              <div key={leverage.id} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {leverage.source === 'keep' ? '😊' : '🔄'}
                </Badge>
                <span className="text-sm">{leverage.block.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleReflect}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        회고하기
      </button>
    </div>
  );
};
