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
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

import { useCycleStore } from '@/stores/cycleStore';
import { useLeverageStore } from '@/stores/leverageStore';
import { generateId } from '@/utils';

import type { Block, DroppableId, LeverageBlock } from '@/types';

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
  const { cycle, setTasks, setBacklog, setMemos, setKeeps, setTries } = useCycleStore();
  const { add } = useLeverageStore();
  const [activeBlocks, setActiveBlocks] = useState<Block[]>([]);

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
        return { blocks: cycle.tasks, setter: setTasks };
      case 'backlog':
        return { blocks: cycle.backlog, setter: setBacklog };
      case 'memos':
        return { blocks: cycle.memos, setter: setMemos };
      default:
        return null;
    }
  };

  const findBlockSource = (blockId: string): { droppableId: DroppableId; block: Block; index: number } | null => {
    const sources: DroppableId[] = ['tasks', 'backlog', 'memos'];

    for (const droppableId of sources) {
      const data = getBlocksAndSetter(droppableId);
      if (!data) continue;

      const index = data.blocks.findIndex((b) => b.id === blockId);
      if (index !== -1) {
        return { droppableId, block: data.blocks[index], index };
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const source = findBlockSource(String(event.active.id));
    if (source) {
      const data = getBlocksAndSetter(source.droppableId);
      if (data) {
        const blocksToMove = getBlockWithChildren(data.blocks, source.index);
        setActiveBlocks(blocksToMove);
      }
    }
  };

  // Block을 LeverageBlock으로 변환
  const blockToLeverageBlock = (
    block: Block,
    source: 'keep' | 'try'
  ): LeverageBlock => ({
    id: generateId(),
    block: { ...block, id: generateId() },
    timing: 'before',
    source,
    status: 'active',
    createdAt: new Date(),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlocks([]);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const source = findBlockSource(activeId);
    if (!source) return;

    const sourceData = getBlocksAndSetter(source.droppableId);
    if (!sourceData) return;

    // 이동할 블록들 (상위 + 하위)
    const blocksToMove = getBlockWithChildren(sourceData.blocks, source.index);
    const blockIds = new Set(blocksToMove.map((b) => b.id));

    // keeps 또는 tries로 드롭하는 경우
    if (overId === 'keeps' || overId === 'tries') {
      // 소스에서 제거
      const newSourceBlocks = sourceData.blocks.filter((b) => !blockIds.has(b.id));
      sourceData.setter(newSourceBlocks);

      // LeverageBlock으로 변환하여 추가
      const leverageBlocks = blocksToMove
        .filter((b) => b.depth === 0) // depth 0만 leverage로
        .map((b) => blockToLeverageBlock(b, overId === 'keeps' ? 'keep' : 'try'));

      if (overId === 'keeps') {
        setKeeps([...cycle.keeps, ...leverageBlocks]);
        leverageBlocks.forEach((lb) => add(lb));
      } else {
        setTries([...cycle.tries, ...leverageBlocks]);
        leverageBlocks.forEach((lb) => add(lb));
      }
      return;
    }

    // 같은 영역 내에서 이동인지 확인
    const overSource = findBlockSource(overId);

    if (overSource && source.droppableId === overSource.droppableId) {
      // 같은 영역 내 재정렬
      const newBlocks = sourceData.blocks.filter((b) => !blockIds.has(b.id));
      const insertIndex = newBlocks.findIndex((b) => b.id === overId);

      if (insertIndex !== -1) {
        newBlocks.splice(insertIndex, 0, ...blocksToMove);
      } else {
        newBlocks.push(...blocksToMove);
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
        const newBlocks = cloneBlocksWithNewIds(blocksToMove);

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
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
  );
};
