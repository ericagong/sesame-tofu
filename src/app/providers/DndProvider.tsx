import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent, DragOverEvent, DragMoveEvent } from '@dnd-kit/core';

import { DndStateContext } from '@/shared/lib/dnd-context';
import { generateId } from '@/shared/lib/utils';
import { usePomodoroStore, type Block, type Insight } from '@/entities/pomodoro';
import { useLeverageStore } from '@/entities/leverage';

// 드롭 영역 ID
export type DroppableId = 'goal' | 'tasks' | 'backlog' | 'memos' | 'insights';

type DndProviderProps = {
  children: React.ReactNode;
};

// 상위 블록과 하위 블록들을 함께 가져오기
const getBlockWithChildren = (blocks: Block[], index: number): Block[] => {
  const block = blocks[index];
  if (block.depth !== 0) return [block];

  const result: Block[] = [block];
  for (let i = index + 1; i < blocks.length; i++) {
    if (blocks[i].depth === 0) break;
    result.push(blocks[i]);
  }
  return result;
};

// 블록들을 새 ID로 복제
const cloneBlocksWithNewIds = (blocks: Block[]): Block[] => {
  const parentIdMap = new Map<string, string>();

  return blocks.map((block) => {
    const newId = generateId();
    if (block.depth === 0) {
      parentIdMap.set(block.id, newId);
    }
    return {
      ...block,
      id: newId,
      parentId: block.parentId ? parentIdMap.get(block.parentId) : undefined,
    };
  });
};

export const DndProvider = ({ children }: DndProviderProps) => {
  const { pomodoro, setTasks, setBacklog, setMemos, setInsights } = usePomodoroStore();
  const { add } = useLeverageStore();
  const [activeBlocks, setActiveBlocks] = useState<Block[]>([]);
  const [overId, setOverId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropDepth, setDropDepth] = useState<0 | 1>(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getBlocksAndSetter = (droppableId: DroppableId) => {
    switch (droppableId) {
      case 'tasks':
        return { blocks: pomodoro.tasks, setter: setTasks };
      case 'backlog':
        return { blocks: pomodoro.backlog, setter: setBacklog };
      case 'memos':
        return { blocks: pomodoro.memos, setter: setMemos };
      default:
        return null;
    }
  };

  const findBlockSource = (blockId: string): { droppableId: DroppableId; block: Block; index: number } | null => {
    const categories: DroppableId[] = ['tasks', 'backlog', 'memos'];

    for (const droppableId of categories) {
      const data = getBlocksAndSetter(droppableId);
      if (!data) continue;

      const index = data.blocks.findIndex((b) => b.id === blockId);
      if (index !== -1) {
        return { droppableId, block: data.blocks[index], index };
      }
    }
    return null;
  };

  // Insight 소스 찾기
  const findInsightSource = (itemId: string): { item: Insight; index: number } | null => {
    const index = pomodoro.insights.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      return { item: pomodoro.insights[index], index };
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    const source = findBlockSource(String(event.active.id));
    if (source) {
      const data = getBlocksAndSetter(source.droppableId);
      if (data) {
        const blocksToMove = getBlockWithChildren(data.blocks, source.index);
        setActiveBlocks(blocksToMove);
      }
    } else {
      // Insight 드래그인지 확인
      const insightSource = findInsightSource(String(event.active.id));
      if (insightSource) {
        // Insight의 block을 activeBlocks에 설정 (오버레이 표시용)
        setActiveBlocks([insightSource.item.block]);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, delta } = event;
    if (!over) return;

    const overElement = document.querySelector(`[data-block-id="${over.id}"]`);
    if (overElement) {
      const rect = overElement.getBoundingClientRect();
      // delta.x가 양수면 오른쪽으로 이동 중
      // 드래그 시작 위치 + delta로 현재 위치 계산
      const activatorRect = event.activatorEvent.target as HTMLElement;
      if (activatorRect) {
        const initialX = (event.activatorEvent as PointerEvent).clientX;
        const currentX = initialX + delta.x;
        const relativeX = currentX - rect.left;
        // 60px 이상 안쪽이면 depth 1
        setDropDepth(relativeX > 60 ? 1 : 0);
      }
    }
  };

  // Block을 Insight로 변환
  const blockToInsight = (
    block: Block,
    timing: 'before' | 'during' | 'after' = 'before'
  ): Insight => ({
    id: generateId(),
    block: { ...block, id: generateId() },
    timing,
    status: 'active',
    createdAt: new Date(),
  });

  // 섹션 드롭 ID 파싱 (insights-before, insights-during 등)
  const parseSectionDropId = (id: string): { timing: 'before' | 'during' | 'after' } | null => {
    const match = id.match(/^insights-(before|during|after)$/);
    if (match) {
      return {
        timing: match[1] as 'before' | 'during' | 'after',
      };
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const currentDropDepth = dropDepth; // 리셋 전에 저장
    setActiveBlocks([]);
    setOverId(null);
    setActiveId(null);
    setDropDepth(0);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    // Insight 드래그 처리
    const insightSource = findInsightSource(activeId);
    if (insightSource) {
      // 다른 Insight 위로 드롭 (재정렬)
      const insightOver = findInsightSource(overId);
      if (insightOver) {
        const items = [...pomodoro.insights];
        const oldIndex = insightSource.index;
        const newIndex = insightOver.index;

        // arrayMove 로직: 제거 후 삽입
        const [movedItem] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, movedItem);
        setInsights(items);
        return;
      }

      // 섹션 영역으로 드롭 (timing 변경)
      const sectionDrop = parseSectionDropId(overId);
      if (sectionDrop) {
        const items = [...pomodoro.insights];
        // timing 업데이트
        items[insightSource.index] = {
          ...items[insightSource.index],
          timing: sectionDrop.timing,
        };
        setInsights(items);
        return;
      }

      // backlog 또는 memos로 드롭 (Insight → Block 변환)
      const targetDroppableId = overId as DroppableId;
      const targetData = getBlocksAndSetter(targetDroppableId);
      const overBlockSource = findBlockSource(overId);

      if (targetData || overBlockSource) {
        const actualTarget = overBlockSource ? overBlockSource.droppableId : targetDroppableId;
        const targetInfo = getBlocksAndSetter(actualTarget);

        if (targetInfo && (actualTarget === 'backlog' || actualTarget === 'memos')) {
          // insights에서 제거
          const insightItems = [...pomodoro.insights];
          const [removedItem] = insightItems.splice(insightSource.index, 1);
          setInsights(insightItems);

          // Insight → Block 변환 (timing 등 제거)
          const newBlock: Block = {
            id: generateId(),
            content: removedItem.block.content,
            depth: 0,
            status: 'active',
          };

          // 타겟에 추가
          if (overBlockSource) {
            const newTargetBlocks = [...targetInfo.blocks];
            newTargetBlocks.splice(overBlockSource.index, 0, newBlock);
            targetInfo.setter(newTargetBlocks);
          } else {
            targetInfo.setter([...targetInfo.blocks, newBlock]);
          }
          return;
        }
      }

      return;
    }

    const source = findBlockSource(activeId);
    if (!source) return;

    const sourceData = getBlocksAndSetter(source.droppableId);
    if (!sourceData) return;

    // 이동할 블록들 (상위 + 하위)
    const blocksToMove = getBlockWithChildren(sourceData.blocks, source.index);
    const blockIds = new Set(blocksToMove.map((b) => b.id));

    // dropDepth에 따라 블록의 depth 조절
    const adjustedBlocks = blocksToMove.map((b, i) => {
      if (i === 0) {
        // 첫 번째 블록(드래그한 블록)의 depth를 currentDropDepth로 설정
        return { ...b, depth: currentDropDepth as 0 | 1 };
      }
      // 하위 블록들은 상대적 depth 유지
      const depthDiff = b.depth - blocksToMove[0].depth;
      const newDepth = Math.min(1, currentDropDepth + depthDiff) as 0 | 1;
      return { ...b, depth: newDepth };
    });

    // insights 섹션으로 드롭하는 경우 (insights-before, insights-during 등)
    const sectionDrop = parseSectionDropId(overId);
    if (sectionDrop) {
      // 소스에서 제거
      const newSourceBlocks = sourceData.blocks.filter((b) => !blockIds.has(b.id));
      sourceData.setter(newSourceBlocks);

      // Insight로 변환하여 추가 (timing 포함)
      const newInsights = blocksToMove
        .filter((b) => b.depth === 0) // depth 0만 insight로
        .map((b) => blockToInsight(b, sectionDrop.timing));

      setInsights([...pomodoro.insights, ...newInsights]);
      newInsights.forEach((insight) => add(insight));
      return;
    }

    // 같은 영역 내에서 이동인지 확인
    const overSource = findBlockSource(overId);

    if (overSource && source.droppableId === overSource.droppableId) {
      // 같은 영역 내 재정렬
      const newBlocks = sourceData.blocks.filter((b) => !blockIds.has(b.id));
      const insertIndex = newBlocks.findIndex((b) => b.id === overId);

      if (insertIndex !== -1) {
        newBlocks.splice(insertIndex, 0, ...adjustedBlocks);
      } else {
        newBlocks.push(...adjustedBlocks);
      }
      sourceData.setter(newBlocks);
    } else {
      // 다른 영역으로 이동
      const targetDroppableId = overId as DroppableId;
      const targetData = getBlocksAndSetter(targetDroppableId);

      if (targetData || overSource) {
        const actualTarget = overSource ? overSource.droppableId : targetDroppableId;
        const targetInfo = getBlocksAndSetter(actualTarget);

        if (!targetInfo) return;

        // 소스에서 제거
        const newSourceBlocks = sourceData.blocks.filter((b) => !blockIds.has(b.id));
        sourceData.setter(newSourceBlocks);

        // 타겟에 추가 (새 ID로)
        const newBlocks = cloneBlocksWithNewIds(adjustedBlocks);

        if (overSource) {
          // 특정 블록 위치에 삽입
          const newTargetBlocks = [...targetInfo.blocks];
          newTargetBlocks.splice(overSource.index, 0, ...newBlocks);
          targetInfo.setter(newTargetBlocks);
        } else {
          // 영역 끝에 추가
          targetInfo.setter([...targetInfo.blocks, ...newBlocks]);
        }
      }
    }
  };

  return (
    <DndStateContext.Provider value={{ overId, activeId, dropDepth }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
        {activeBlocks.length > 0 && (
          <div className="space-y-1 px-2 py-1 bg-background border rounded shadow-lg">
            {activeBlocks.map((block) => (
              <div
                key={block.id}
                className={`text-sm ${block.depth === 1 ? 'ml-4' : ''}`}
              >
                {block.content || '(빈 블록)'}
              </div>
            ))}
          </div>
        )}
      </DragOverlay>
      </DndContext>
    </DndStateContext.Provider>
  );
};
