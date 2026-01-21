import { useCycleStore } from '@/stores/cycleStore';
import { useLeverageStore } from '@/stores/leverageStore';
import { BlockEditor } from '@/components/BlockEditor';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const ExecutePhase = () => {
  const { cycle, setTasks, setMemos, setPhase } = useCycleStore();
  const { getByTiming } = useLeverageStore();

  const duringLeverages = getByTiming('during');

  // depth 0 완료 카운트 (배지용)
  const completedDepth0Count = cycle.tasks.filter(
    (t) => t.depth === 0 && t.status === 'deleted'
  ).length;
  const totalDepth0Count = cycle.tasks.filter((t) => t.depth === 0).length;

  // 실제수행률 계산 (depth 0 + depth 1 모두 포함)
  const allCompletedCount = cycle.tasks.filter((t) => t.status === 'deleted').length;
  const allTotalCount = cycle.tasks.length;

  const handleReflect = () => {
    setPhase('reflect');
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          과제를 완료하면 체크하세요.
        </p>
        <Badge variant="secondary">
          {completedDepth0Count} / {totalDepth0Count} 완료
        </Badge>
      </div>

      {/* 메인 카드 */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* 목표 */}
          <div className="space-y-2 opacity-50">
            <span className="text-xs text-muted-foreground">목표</span>
            <p className="text-xs">{cycle.goal?.content}</p>
          </div>

          {/* 과제 */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">과제</span>
            <BlockEditor
              blocks={cycle.tasks}
              onChange={setTasks}
              showOrder
              droppableId="tasks"
            />
          </div>

          {/* 점검 */}
          <div className="space-y-3">
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
                  className="h-full bg-gray-400 rounded-full transition-all"
                  style={{ width: `${cycle.probability}%` }}
                />
              </div>
            </div>

            {/* 실제수행률 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">실제수행률</span>
                <span className="text-xs font-bold text-foreground">
                  {allTotalCount > 0 ? Math.round((allCompletedCount / allTotalCount) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all"
                  style={{ width: `${allTotalCount > 0 ? (allCompletedCount / allTotalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 작업 중 Leverage */}
      {duringLeverages.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <span className="text-xs text-muted-foreground">작업 중 기억하세요</span>
            <div className="space-y-2">
              {duringLeverages.map((leverage) => (
                <div key={leverage.id} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {leverage.source === 'keep' ? 'Keep' : 'Try'}
                  </Badge>
                  <span className="text-xs">{leverage.block.content}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 작업 중 메모 */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 space-y-2">
          <span className="text-xs text-muted-foreground">작업 중 메모</span>
          <BlockEditor
            blocks={cycle.memos}
            onChange={setMemos}
            placeholder="메모 추가..."
            droppableId="memos"
          />
        </CardContent>
      </Card>

      {/* 이전/다음 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={() => setPhase('plan')}
          className="text-sm hover:underline"
        >
          이전
        </button>
        <button
          onClick={handleReflect}
          className="text-sm hover:underline"
        >
          다음
        </button>
      </div>
    </div>
  );
};
