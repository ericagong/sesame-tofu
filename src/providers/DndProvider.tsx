import { useState, createContext, useContext } from 'react';
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

type DndStateContextType = {
  overId: string | null;
  activeId: string | null;
  dropDepth: 0 | 1;
};

const DndStateContext = createContext<DndStateContextType>({
  overId: null,
  activeId: null,
  dropDepth: 0,
});

export const useDndState = () => useContext(DndStateContext);

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

  // LeverageBlock 소스 찾기 (keeps/tries)
  const findLeverageBlockSource = (itemId: string): { type: 'keeps' | 'tries'; item: LeverageBlock; index: number } | null => {
    const keepsIndex = cycle.keeps.findIndex((k) => k.id === itemId);
    if (keepsIndex !== -1) {
      return { type: 'keeps', item: cycle.keeps[keepsIndex], index: keepsIndex };
    }

    const triesIndex = cycle.tries.findIndex((t) => t.id === itemId);
    if (triesIndex !== -1) {
      return { type: 'tries', item: cycle.tries[triesIndex], index: triesIndex };
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
      // LeverageBlock (keeps/tries) 드래그인지 확인
      const leverageSource = findLeverageBlockSource(String(event.active.id));
      if (leverageSource) {
        // LeverageBlock의 block을 activeBlocks에 설정 (오버레이 표시용)
        setActiveBlocks([leverageSource.item.block]);
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

  // Block을 LeverageBlock으로 변환
  const blockToLeverageBlock = (
    block: Block,
    source: 'keep' | 'try',
    timing: 'before' | 'during' | 'after' = 'before'
  ): LeverageBlock => ({
    id: generateId(),
    block: { ...block, id: generateId() },
    timing,
    source,
    status: 'active',
    createdAt: new Date(),
  });

  // 섹션 드롭 ID 파싱 (keeps-before, tries-during 등)
  const parseSectionDropId = (id: string): { type: 'keeps' | 'tries'; timing: 'before' | 'during' | 'after' } | null => {
    const match = id.match(/^(keeps|tries)-(before|during|after)$/);
    if (match) {
      return {
        type: match[1] as 'keeps' | 'tries',
        timing: match[2] as 'before' | 'during' | 'after',
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

    // LeverageBlock (keeps/tries) 드래그 처리
    const leverageSource = findLeverageBlockSource(activeId);
    if (leverageSource) {
      // 다른 아이템 위로 드롭 (같은 영역 내 재정렬)
      const leverageOver = findLeverageBlockSource(overId);
      if (leverageOver && leverageSource.type === leverageOver.type) {
        const items = leverageSource.type === 'keeps' ? [...cycle.keeps] : [...cycle.tries];
        const setter = leverageSource.type === 'keeps' ? setKeeps : setTries;

        const oldIndex = leverageSource.index;
        const newIndex = leverageOver.index;

        // arrayMove 로직: 제거 후 삽입
        const [movedItem] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, movedItem);
        setter(items);
        return;
      }

      // 섹션 영역으로 드롭 (timing 변경)
      const sectionDrop = parseSectionDropId(overId);
      if (sectionDrop && sectionDrop.type === leverageSource.type) {
        // 같은 타입(keeps/tries) 내에서 섹션 변경
        const items = leverageSource.type === 'keeps' ? [...cycle.keeps] : [...cycle.tries];
        const setter = leverageSource.type === 'keeps' ? setKeeps : setTries;

        // timing 업데이트
        items[leverageSource.index] = {
          ...items[leverageSource.index],
          timing: sectionDrop.timing,
        };
        setter(items);
        return;
      }

      // backlog 또는 memos로 드롭 (LeverageBlock → Block 변환)
      const targetDroppableId = overId as DroppableId;
      const targetData = getBlocksAndSetter(targetDroppableId);
      const overBlockSource = findBlockSource(overId);

      if (targetData || overBlockSource) {
        const actualTarget = overBlockSource ? overBlockSource.droppableId : targetDroppableId;
        const targetInfo = getBlocksAndSetter(actualTarget);

        if (targetInfo && (actualTarget === 'backlog' || actualTarget === 'memos')) {
          // keeps/tries에서 제거
          const leverageItems = leverageSource.type === 'keeps' ? [...cycle.keeps] : [...cycle.tries];
          const leverageSetter = leverageSource.type === 'keeps' ? setKeeps : setTries;
          const [removedItem] = leverageItems.splice(leverageSource.index, 1);
          leverageSetter(leverageItems);

          // LeverageBlock → Block 변환 (timing, source 등 제거)
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

    // keeps 또는 tries 섹션으로 드롭하는 경우 (keeps-before, tries-during 등)
    const sectionDrop = parseSectionDropId(overId);
    if (sectionDrop) {
      // 소스에서 제거
      const newSourceBlocks = sourceData.blocks.filter((b) => !blockIds.has(b.id));
      sourceData.setter(newSourceBlocks);

      // LeverageBlock으로 변환하여 추가 (timing 포함)
      const leverageBlocks = blocksToMove
        .filter((b) => b.depth === 0) // depth 0만 leverage로
        .map((b) => blockToLeverageBlock(
          b,
          sectionDrop.type === 'keeps' ? 'keep' : 'try',
          sectionDrop.timing
        ));

      if (sectionDrop.type === 'keeps') {
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
