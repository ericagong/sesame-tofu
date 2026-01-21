import { useCycleStore } from '@/stores/cycleStore';
import { BlockEditor } from './BlockEditor';

export const Sidebar = () => {
  const { cycle, setBacklog, setMemos } = useCycleStore();

  return (
    <div className="h-full flex flex-col border-l">
      {/* 다음에 할 일 */}
      <div className="flex-1 p-4 border-b">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          다음에 할 일
        </h3>
        <BlockEditor
          blocks={cycle.backlog}
          onChange={setBacklog}
          placeholder="다음에 할 일 추가..."
          droppableId="backlog"
        />
      </div>

      {/* 작업 중 메모 */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          작업 중 메모
        </h3>
        <BlockEditor
          blocks={cycle.memos}
          onChange={setMemos}
          placeholder="메모 추가..."
          droppableId="memos"
        />
      </div>
    </div>
  );
};
